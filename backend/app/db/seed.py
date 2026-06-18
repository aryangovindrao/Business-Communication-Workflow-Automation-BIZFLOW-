"""
Seed demo data that mirrors the frontend's mock dataset (same org, users,
emails and workflow graphs).

Idempotent on the demo organization (``org_acme``): safe to re-run and coexists
with real tenants. Loaded automatically on startup when ``SEED_ON_STARTUP=true``,
or on demand with ``python -m app.db.seed``.
"""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import (
    Contact,
    Message,
    Notification,
    Organization,
    Role,
    User,
    Workflow,
    WorkflowRun,
)

log = logging.getLogger("bizflow.seed")

DEMO_PASSWORD = "demo1234"
ORG_ID = "org_acme"


def _mins(n: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(minutes=n)


def _hours(n: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(hours=n)


def _days(n: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=n)


def _thread(name: str, body: str) -> list[dict]:
    return [
        {
            "id": f"te_{abs(hash(body)) % 10**8}",
            "authorName": name,
            "authorRole": "customer",
            "body": body,
            "createdAt": _hours(5).isoformat(),
        }
    ]


def seed_demo_data(db: Session) -> None:
    """Insert the Acme Corp demo tenant if it isn't already present."""
    if db.get(Organization, ORG_ID):
        log.info("Demo data already present (org %s) — skipping.", ORG_ID)
        return
    log.info("Seeding demo data…")

    db.add(Organization(id=ORG_ID, name="Acme Corp", plan="pro"))
    db.flush()  # persist the org first so dependent rows satisfy the FK

    for name, perms in [
        ("Admin", ["*"]),
        ("Manager", ["read", "write", "approve"]),
        ("Agent", ["read", "write"]),
        ("Viewer", ["read"]),
    ]:
        db.add(Role(organization_id=ORG_ID, name=name, description=f"{name} role", permissions=perms))

    users = [
        ("usr_admin", "Alex Rivera", "alex@acme.io", "Admin", "active", _mins(2)),
        ("usr_manager", "Priya Nair", "priya@acme.io", "Manager", "active", _mins(40)),
        ("usr_agent1", "Marcus Chen", "marcus@acme.io", "Agent", "active", _hours(3)),
        ("usr_agent2", "Sofia Almeida", "sofia@acme.io", "Agent", "active", _hours(1)),
        ("usr_viewer", "Tom Becker", "tom@acme.io", "Viewer", "invited", None),
    ]
    for uid, name, email, role, status, last in users:
        db.add(
            User(
                id=uid,
                organization_id=ORG_ID,
                name=name,
                email=email,
                hashed_password=hash_password(DEMO_PASSWORD),
                role=role,
                status=status,
                last_active=last,
            )
        )

    _seed_messages(db)
    _seed_contacts(db)
    _seed_workflows(db)
    _seed_notifications(db)

    db.commit()
    log.info("Seed complete.")


def _seed_messages(db: Session) -> None:
    data = [
        dict(
            id="msg_1", channel="email", from_name="Jordan Blake",
            from_email="jordan.blake@globex.com",
            subject="Interested in the Enterprise plan for 50 seats",
            body="Hi there, we're evaluating workflow automation tools for our 50-person support team. Could you share Enterprise pricing and whether you support SSO and audit logs?",
            intent="Sales Inquiry", intent_confidence=0.94, sentiment="Positive",
            sentiment_score=0.88, status="open", assignee_id="usr_agent1",
            assignee_name="Marcus Chen", tags=["enterprise", "pilot"], starred=True,
            unread=True, created_at=_hours(2),
        ),
        dict(
            id="msg_2", channel="email", from_name="Dana Whitfield",
            from_email="dana@brightlabs.co",
            subject="API returning 500 on bulk webhook delivery",
            body="Since 9am UTC our webhook endpoint receives intermittent 500 errors. About 1 in 5 events fail. Request ID: whk_88213.",
            intent="Technical Support", intent_confidence=0.91, sentiment="Negative",
            sentiment_score=0.79, status="open", assignee_id="usr_agent2",
            assignee_name="Sofia Almeida", tags=["webhooks", "urgent"], starred=False,
            unread=True, created_at=_hours(1),
        ),
        dict(
            id="msg_3", channel="contact_form", from_name="Liang Wei",
            from_email="liang.wei@nimbus.io",
            subject="Refund for duplicate annual charge",
            body="I was charged twice for my annual subscription on June 12 (INV-4471 and INV-4472). Please refund the duplicate $480.",
            intent="Refund Request", intent_confidence=0.89, sentiment="Negative",
            sentiment_score=0.62, status="pending", assignee_id="usr_agent1",
            assignee_name="Marcus Chen", tags=["billing", "refund"], starred=False,
            unread=False, created_at=_hours(6),
        ),
        dict(
            id="msg_4", channel="chat", from_name="Emma Sørensen",
            from_email="emma@frostbyte.dk",
            subject="Can we book a demo next Tuesday?",
            body="Loving the trial! Could we set up a 30-min demo next Tuesday 2pm or 3pm CET to walk through the workflow builder?",
            intent="Meeting Request", intent_confidence=0.93, sentiment="Positive",
            sentiment_score=0.95, status="open", tags=["demo"], starred=True,
            unread=True, created_at=_mins(35),
        ),
        dict(
            id="msg_5", channel="email", from_name="Raj Patel",
            from_email="raj.patel@quantix.com",
            subject="Question about invoice tax breakdown",
            body="Our finance team needs a VAT breakdown on invoice INV-4502. Could you reissue with line-item tax?",
            intent="Billing Issue", intent_confidence=0.84, sentiment="Neutral",
            sentiment_score=0.55, status="resolved", assignee_id="usr_agent2",
            assignee_name="Sofia Almeida", tags=["billing"], starred=False,
            unread=False, created_at=_days(1),
        ),
        dict(
            id="msg_6", channel="contact_form", from_name="Hannah Mills",
            from_email="hannah@coastal.org",
            subject="Do you offer nonprofit discounts?",
            body="We're a small nonprofit (12 staff). Do you offer nonprofit discounts on Pro? And can we export all our data if we leave?",
            intent="General Inquiry", intent_confidence=0.72, sentiment="Neutral",
            sentiment_score=0.60, status="open", tags=["nonprofit"], starred=False,
            unread=False, created_at=_hours(9),
        ),
    ]
    for d in data:
        db.add(
            Message(
                organization_id=ORG_ID,
                preview=d["body"][:110],
                thread=_thread(d["from_name"], d["body"]),
                **d,
            )
        )


def _seed_contacts(db: Session) -> None:
    contacts = [
        dict(id="con_1", name="Jordan Blake", email="jordan.blake@globex.com",
             phone="+1 415 555 0147", company="Globex", type="lead", status="qualified",
             value=48000, owner_name="Marcus Chen", created_at=_days(9), last_contact_at=_hours(2),
             interactions=[
                 {"id": "int_1", "type": "email", "summary": "Inbound: Enterprise pricing for 50 seats", "createdAt": _hours(2).isoformat()},
                 {"id": "int_2", "type": "call", "summary": "Discovery call — needs SSO + audit logs", "createdAt": _days(3).isoformat()},
             ],
             meetings=[{"id": "mtg_1", "title": "Discovery call", "date": _days(3).isoformat(), "attendees": ["Jordan Blake", "Marcus Chen"], "notes": "Wants pilot within 2 weeks."}]),
        dict(id="con_2", name="Emma Sørensen", email="emma@frostbyte.dk",
             phone="+45 31 55 02 11", company="Frostbyte", type="lead", status="proposal",
             value=21000, owner_name="Marcus Chen", created_at=_days(14), last_contact_at=_mins(35),
             interactions=[{"id": "int_3", "type": "chat", "summary": "Requested demo next Tuesday", "createdAt": _mins(35).isoformat()}], meetings=[]),
        dict(id="con_3", name="Diego Fernández", email="diego@mercadolite.mx",
             company="MercadoLite", type="customer", status="won", value=36000,
             owner_name="Priya Nair", created_at=_days(120), last_contact_at=_hours(12),
             interactions=[{"id": "int_4", "type": "email", "summary": "Expansion: +10 seats", "createdAt": _hours(12).isoformat()}], meetings=[]),
        dict(id="con_4", name="Liang Wei", email="liang.wei@nimbus.io",
             company="Nimbus", type="customer", status="won", value=9600,
             owner_name="Sofia Almeida", created_at=_days(200), last_contact_at=_hours(6),
             interactions=[{"id": "int_5", "type": "note", "summary": "Duplicate charge refund in progress", "createdAt": _hours(6).isoformat()}], meetings=[]),
        dict(id="con_5", name="Hannah Mills", email="hannah@coastal.org",
             company="Coastal Trust", type="lead", status="new", value=4200,
             created_at=_hours(9), last_contact_at=_hours(9),
             interactions=[{"id": "int_6", "type": "email", "summary": "Asked about nonprofit discount", "createdAt": _hours(9).isoformat()}], meetings=[]),
        dict(id="con_6", name="Nadia Hassan", email="nadia@vertex.io",
             company="Vertex", type="lead", status="contacted", value=15000,
             owner_name="Marcus Chen", created_at=_days(5), last_contact_at=_days(2),
             interactions=[], meetings=[]),
        dict(id="con_7", name="Tomáš Novák", email="tomas@dataforge.cz",
             company="DataForge", type="lead", status="lost", value=12000,
             owner_name="Priya Nair", created_at=_days(40), last_contact_at=_days(20),
             interactions=[], meetings=[]),
    ]
    for c in contacts:
        db.add(Contact(organization_id=ORG_ID, **c))


def _trigger_node(label, event):
    return {"id": "n1", "type": "trigger", "position": {"x": 80, "y": 160},
            "data": {"label": label, "kind": "trigger", "config": {"event": event}}}


def _seed_workflows(db: Session) -> None:
    wf1_nodes = [
        _trigger_node("New Email Received", "email_received"),
        {"id": "n2", "type": "condition", "position": {"x": 360, "y": 160},
         "data": {"label": "Intent = Sales Inquiry", "kind": "condition",
                  "config": {"field": "intent", "op": "equals", "value": "Sales Inquiry"}}},
        {"id": "n3", "type": "action", "position": {"x": 640, "y": 60},
         "data": {"label": "Assign to Sales Team", "kind": "action",
                  "config": {"action": "assign_team", "team": "Sales"}}},
        {"id": "n4", "type": "action", "position": {"x": 640, "y": 180},
         "data": {"label": "Generate AI Reply", "kind": "action",
                  "config": {"action": "generate_reply", "tone": "professional"}}},
        {"id": "n5", "type": "action", "position": {"x": 640, "y": 300},
         "data": {"label": "Send Slack Notification", "kind": "action",
                  "config": {"action": "slack_notify", "channel": "#sales-inbound"}}},
    ]
    wf1_edges = [
        {"id": "e1", "source": "n1", "target": "n2"},
        {"id": "e2", "source": "n2", "target": "n3"},
        {"id": "e3", "source": "n2", "target": "n4"},
        {"id": "e4", "source": "n2", "target": "n5"},
    ]
    wf2_nodes = [
        _trigger_node("New Message", "message_received"),
        {"id": "n2", "type": "condition", "position": {"x": 360, "y": 140},
         "data": {"label": "Sentiment = Negative", "kind": "condition",
                  "config": {"field": "sentiment", "op": "equals", "value": "Negative"}}},
        {"id": "n3", "type": "action", "position": {"x": 640, "y": 140},
         "data": {"label": "Set Priority: Urgent", "kind": "action",
                  "config": {"action": "set_priority", "priority": "urgent"}}},
    ]
    simple_edges = [{"id": "e1", "source": "n1", "target": "n2"}, {"id": "e2", "source": "n2", "target": "n3"}]

    db.add(Workflow(id="wf_1", organization_id=ORG_ID, name="Route Sales Inquiries",
                    description="When a new email is classified as a Sales Inquiry, assign it to Sales, draft a reply, and notify Slack.",
                    status="active", nodes=wf1_nodes, edges=wf1_edges, run_count=342,
                    success_rate=0.97, created_at=_days(30), last_run_at=_hours(2)))
    db.add(Workflow(id="wf_2", organization_id=ORG_ID, name="Escalate Negative Support",
                    description="Negative-sentiment messages are flagged urgent and routed to a senior agent.",
                    status="active", nodes=wf2_nodes, edges=simple_edges, run_count=118,
                    success_rate=0.99, created_at=_days(22), last_run_at=_hours(1)))
    db.add(Workflow(id="wf_3", organization_id=ORG_ID, name="Refund Approval Flow",
                    description="Refund requests above $200 require manager approval before processing.",
                    status="paused", nodes=[
                        _trigger_node("Refund Requested", "refund_requested"),
                        {"id": "n2", "type": "condition", "position": {"x": 360, "y": 140},
                         "data": {"label": "Amount > $200", "kind": "condition", "config": {"field": "amount", "op": "gt", "value": "200"}}},
                        {"id": "n3", "type": "action", "position": {"x": 640, "y": 140},
                         "data": {"label": "Request Manager Approval", "kind": "action", "config": {"action": "request_approval", "role": "Manager"}}},
                    ], edges=simple_edges, run_count=54, success_rate=0.92, created_at=_days(15), last_run_at=_days(2)))

    runs = [
        ("wf_1", "Route Sales Inquiries", "success", "email from jordan.blake@globex.com", _hours(2), 1240),
        ("wf_2", "Escalate Negative Support", "success", "message from dana@brightlabs.co", _hours(1), 880),
        ("wf_1", "Route Sales Inquiries", "success", "email from diego@mercadolite.mx", _hours(12), 1530),
        ("wf_3", "Refund Approval Flow", "failed", "refund from liang.wei@nimbus.io", _days(2), 410),
    ]
    for wid, wname, st, trig, started, dur in runs:
        db.add(WorkflowRun(organization_id=ORG_ID, workflow_id=wid, workflow_name=wname,
                           status=st, trigger=trig, started_at=started, duration_ms=dur))


def _seed_notifications(db: Session) -> None:
    items = [
        ("new_lead", "New lead: Jordan Blake (Globex)", "Enterprise inquiry for 50 seats — auto-assigned to Marcus Chen.", False, "in_app", _hours(2)),
        ("ticket_created", "Ticket #4471 created", "Webhook 500 errors reported by Dana Whitfield — priority Urgent.", False, "slack", _hours(1)),
        ("approval_required", "Approval required: $480 refund", "Liang Wei requested a duplicate-charge refund above the $200 threshold.", False, "in_app", _hours(6)),
        ("workflow_failed", "Workflow failed: Refund Approval Flow", "Run failed at 'Request Manager Approval' — no manager online.", True, "email", _days(2)),
        ("message_received", "New demo request from Emma Sørensen", "Chat message — wants a demo next Tuesday 2–3pm CET.", True, "in_app", _mins(35)),
    ]
    for type_, title, body, read, channel, created in items:
        db.add(Notification(organization_id=ORG_ID, type=type_, title=title, body=body,
                            read=read, channel=channel, created_at=created))


def run() -> None:
    """Standalone entrypoint: ``python -m app.db.seed``."""
    import app.models  # noqa: F401  (ensure every table is registered)
    from app.core.database import Base, SessionLocal, engine

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_demo_data(db)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run()
