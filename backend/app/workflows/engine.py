"""
Workflow engine.

Given a domain event (e.g. a new message), it finds active workflows whose
trigger matches, evaluates their condition nodes against the message, runs the
action nodes, and records a WorkflowRun. Designed to be called inline from the
API or from a Celery task.
"""
import logging
import time
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai import ai
from app.integrations.email import send_email
from app.integrations.slack import send_slack
from app.models import Message, Workflow, WorkflowRun
from app.services.notifications import create_notification

log = logging.getLogger("bizflow.workflows")


def _trigger_matches(node: dict, event: str, message: Message) -> bool:
    cfg_event = node.get("data", {}).get("config", {}).get("event", "")
    if cfg_event == event or cfg_event == "message_received":
        return True
    return cfg_event == "email_received" and message.channel == "email"


def _resolve_field(field: str, message: Message):
    return {
        "intent": message.intent,
        "sentiment": message.sentiment,
        "channel": message.channel,
        "status": message.status,
        "from_email": message.from_email,
    }.get(field)


def _evaluate_condition(node: dict, message: Message) -> bool:
    cfg = node.get("data", {}).get("config", {})
    field, op, value = cfg.get("field"), cfg.get("op", "equals"), cfg.get("value")
    actual = _resolve_field(field, message)
    if actual is None:
        return True  # field not applicable to this event → don't block
    if op in ("equals", "eq"):
        return str(actual) == str(value)
    if op in ("not_equals", "neq"):
        return str(actual) != str(value)
    if op == "contains":
        return str(value).lower() in str(actual).lower()
    return True


def _run_action(db: Session, node: dict, message: Message) -> None:
    cfg = node.get("data", {}).get("config", {})
    action = cfg.get("action")

    if action == "assign_team":
        message.assignee_name = f"{cfg.get('team', 'Support')} Team"
    elif action == "generate_reply":
        draft = ai.generate_reply(message.body, cfg.get("tone", "professional"))
        message.thread = list(message.thread) + [
            {
                "id": f"te_{int(time.time() * 1000)}",
                "authorName": "AI Assistant",
                "authorRole": "ai",
                "body": draft,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        ]
    elif action == "slack_notify":
        send_slack(f"New {message.intent} from {message.from_name}: {message.subject}")
        create_notification(
            db,
            organization_id=message.organization_id,
            type="message_received",
            title=f"{message.intent} from {message.from_name}",
            body=message.subject,
            channel="slack",
        )
    elif action == "set_priority":
        message.tags = sorted(set(list(message.tags) + [f"priority:{cfg.get('priority', 'high')}"]))
    elif action == "request_approval":
        create_notification(
            db,
            organization_id=message.organization_id,
            type="approval_required",
            title=f"Approval required: {message.subject}",
            body=f"Requires {cfg.get('role', 'Manager')} approval.",
            channel="in_app",
        )
    elif action == "send_email":
        send_email(message.from_email, f"Re: {message.subject}", "Thanks for your message.")
    else:
        log.info("Unknown action '%s' — skipped", action)


def run_workflows_for_message(
    db: Session, message: Message, event: str = "message_received"
) -> list[WorkflowRun]:
    """Execute all matching active workflows for a message. Caller commits."""
    workflows = db.scalars(
        select(Workflow).where(
            Workflow.organization_id == message.organization_id,
            Workflow.status == "active",
        )
    ).all()

    runs: list[WorkflowRun] = []
    for wf in workflows:
        nodes = wf.nodes or []
        triggers = [n for n in nodes if n.get("type") == "trigger"]
        if not any(_trigger_matches(t, event, message) for t in triggers):
            continue

        conditions = [n for n in nodes if n.get("type") == "condition"]
        if not all(_evaluate_condition(c, message) for c in conditions):
            continue

        started = time.perf_counter()
        status = "success"
        try:
            for action in (n for n in nodes if n.get("type") == "action"):
                _run_action(db, action, message)
        except Exception as exc:  # pragma: no cover - defensive
            status = "failed"
            log.warning("Workflow %s failed: %s", wf.id, exc)

        duration_ms = int((time.perf_counter() - started) * 1000)
        run = WorkflowRun(
            organization_id=wf.organization_id,
            workflow_id=wf.id,
            workflow_name=wf.name,
            status=status,
            trigger=f"{event} from {message.from_email}",
            started_at=datetime.now(timezone.utc),
            duration_ms=max(duration_ms, 1),
        )
        db.add(run)
        runs.append(run)

        # Rolling success-rate update.
        prev_success = wf.success_rate * wf.run_count
        wf.run_count += 1
        wf.success_rate = (prev_success + (1 if status == "success" else 0)) / wf.run_count
        wf.last_run_at = run.started_at

    return runs
