"""
Celery tasks — background jobs for email processing, follow-ups, reports,
CRM sync, and notification delivery. Run with:

    celery -A app.workers.celery_app:celery_app worker --loglevel=info
    celery -A app.workers.celery_app:celery_app beat   --loglevel=info
"""
import logging

from app.ai import get_ai_provider
from app.core.database import SessionLocal
from app.integrations.email import send_email
from app.integrations.slack import send_slack
from app.models import Message
from app.workers.celery_app import celery_app
from app.workflows.engine import run_workflows_for_message

log = logging.getLogger("bizflow.tasks")


@celery_app.task(name="app.workers.tasks.process_message")
def process_message(message_id: str) -> dict:
    """Classify a message with AI and run matching workflows."""
    with SessionLocal() as db:
        msg = db.get(Message, message_id)
        if not msg:
            return {"ok": False, "reason": "not found"}
        provider = get_ai_provider()
        intent = provider.classify_intent(msg.body)
        sentiment = provider.analyze_sentiment(msg.body)
        msg.intent = intent["intent"]
        msg.intent_confidence = intent["confidence"]
        msg.sentiment = sentiment["sentiment"]
        msg.sentiment_score = sentiment["score"]
        event = "email_received" if msg.channel == "email" else "message_received"
        runs = run_workflows_for_message(db, msg, event)
        db.commit()
        return {"ok": True, "intent": msg.intent, "workflows_run": len(runs)}


@celery_app.task(name="app.workers.tasks.deliver_notification")
def deliver_notification(channel: str, title: str, body: str, to: str | None = None) -> bool:
    if channel == "slack":
        return send_slack(f"*{title}*\n{body}")
    if channel == "email" and to:
        return send_email(to, title, body)
    log.info("[in_app] %s — %s", title, body)
    return True


@celery_app.task(name="app.workers.tasks.run_followups")
def run_followups() -> dict:
    """Find stale open messages and queue follow-up reminders (placeholder)."""
    with SessionLocal() as db:
        stale = db.query(Message).filter(Message.status == "open").count()
        log.info("Follow-up sweep: %s open messages", stale)
        return {"open_messages": stale}


@celery_app.task(name="app.workers.tasks.generate_daily_report")
def generate_daily_report() -> dict:
    with SessionLocal() as db:
        total = db.query(Message).count()
    log.info("Daily report generated: %s total messages", total)
    return {"total_messages": total}


@celery_app.task(name="app.workers.tasks.sync_crm")
def sync_crm() -> dict:
    log.info("CRM sync run (placeholder)")
    return {"ok": True}
