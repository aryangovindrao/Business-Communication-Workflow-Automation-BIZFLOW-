import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import desc, or_, select

from app.ai import get_ai_provider
from app.core.deps import CurrentUser, DbSession
from app.models import Message
from app.schemas.message import (
    AssignRequest,
    MessageOut,
    ReclassifyResponse,
    ReplyRequest,
    StatusUpdate,
)
from app.services.audit import record_audit
from app.workflows.engine import run_workflows_for_message

router = APIRouter(tags=["messages"])


def _owned(db, user, message_id: str) -> Message:
    msg = db.get(Message, message_id)
    if not msg or msg.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Message not found")
    return msg


@router.get("/messages", response_model=list[MessageOut])
def list_messages(
    user: CurrentUser,
    db: DbSession,
    status: str | None = Query(None),
    channel: str | None = Query(None),
    intent: str | None = Query(None),
    search: str | None = Query(None),
):
    stmt = select(Message).where(Message.organization_id == user.organization_id)
    if status and status != "all":
        stmt = stmt.where(Message.status == status)
    if channel and channel != "all":
        stmt = stmt.where(Message.channel == channel)
    if intent and intent != "all":
        stmt = stmt.where(Message.intent == intent)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                Message.subject.ilike(like),
                Message.from_name.ilike(like),
                Message.body.ilike(like),
            )
        )
    stmt = stmt.order_by(desc(Message.created_at))
    return db.scalars(stmt).all()


@router.get("/messages/{message_id}", response_model=MessageOut)
def get_message(message_id: str, user: CurrentUser, db: DbSession):
    return _owned(db, user, message_id)


@router.patch("/messages/{message_id}/status", response_model=MessageOut)
def update_status(message_id: str, payload: StatusUpdate, user: CurrentUser, db: DbSession):
    msg = _owned(db, user, message_id)
    msg.status = payload.status
    record_audit(db, user=user, action="message.status", resource_type="message", resource_id=message_id)
    db.commit()
    db.refresh(msg)
    return msg


@router.patch("/messages/{message_id}/assign", response_model=MessageOut)
def assign(message_id: str, payload: AssignRequest, user: CurrentUser, db: DbSession):
    msg = _owned(db, user, message_id)
    msg.assignee_id = payload.assignee_id
    msg.assignee_name = payload.assignee_name
    db.commit()
    db.refresh(msg)
    return msg


@router.post("/messages/{message_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(message_id: str, user: CurrentUser, db: DbSession):
    msg = _owned(db, user, message_id)
    msg.unread = False
    db.commit()


@router.post("/messages/{message_id}/reply", response_model=MessageOut)
def reply(message_id: str, payload: ReplyRequest, user: CurrentUser, db: DbSession):
    msg = _owned(db, user, message_id)
    msg.thread = list(msg.thread) + [
        {
            "id": f"te_{int(time.time() * 1000)}",
            "authorName": user.name,
            "authorRole": "agent",
            "body": payload.body,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    ]
    msg.status = "pending"
    record_audit(db, user=user, action="message.reply", resource_type="message", resource_id=message_id)
    db.commit()
    db.refresh(msg)
    return msg


@router.post("/messages/{message_id}/reclassify", response_model=ReclassifyResponse)
def reclassify(message_id: str, user: CurrentUser, db: DbSession):
    msg = _owned(db, user, message_id)
    provider = get_ai_provider()
    intent = provider.classify_intent(msg.body)
    sentiment = provider.analyze_sentiment(msg.body)
    msg.intent = intent["intent"]
    msg.intent_confidence = intent["confidence"]
    msg.sentiment = sentiment["sentiment"]
    msg.sentiment_score = sentiment["score"]
    db.commit()
    return ReclassifyResponse(
        intent=msg.intent, sentiment=msg.sentiment, confidence=msg.intent_confidence
    )


@router.post("/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def ingest(payload: MessageOut, user: CurrentUser, db: DbSession):
    """Ingest a new inbound message: AI-classify, persist, run workflows."""
    provider = get_ai_provider()
    intent = provider.classify_intent(payload.body)
    sentiment = provider.analyze_sentiment(payload.body)
    msg = Message(
        organization_id=user.organization_id,
        channel=payload.channel,
        from_name=payload.from_name,
        from_email=payload.from_email,
        subject=payload.subject,
        preview=payload.body[:120],
        body=payload.body,
        intent=intent["intent"],
        intent_confidence=intent["confidence"],
        sentiment=sentiment["sentiment"],
        sentiment_score=sentiment["score"],
        status="open",
        tags=[],
        thread=[
            {
                "id": f"te_{int(time.time() * 1000)}",
                "authorName": payload.from_name,
                "authorRole": "customer",
                "body": payload.body,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        ],
    )
    db.add(msg)
    db.flush()
    event = "email_received" if msg.channel == "email" else "message_received"
    run_workflows_for_message(db, msg, event)
    db.commit()
    db.refresh(msg)
    return msg
