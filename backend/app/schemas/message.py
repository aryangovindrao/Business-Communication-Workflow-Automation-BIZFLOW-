from datetime import datetime
from typing import Any

from app.schemas.base import CamelModel


class MessageOut(CamelModel):
    id: str
    organization_id: str
    channel: str
    from_name: str
    from_email: str
    subject: str
    preview: str
    body: str
    intent: str
    intent_confidence: float
    sentiment: str
    sentiment_score: float
    status: str
    assignee_id: str | None = None
    assignee_name: str | None = None
    tags: list[str] = []
    starred: bool = False
    unread: bool = True
    created_at: datetime
    thread: list[dict[str, Any]] = []


class StatusUpdate(CamelModel):
    status: str


class AssignRequest(CamelModel):
    assignee_id: str
    assignee_name: str | None = None


class ReplyRequest(CamelModel):
    body: str


class ReclassifyResponse(CamelModel):
    intent: str
    sentiment: str
    confidence: float
