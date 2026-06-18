from sqlalchemy import JSON, Boolean, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, new_id


class Message(TimestampMixin, Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: new_id("msg")
    )
    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id"), nullable=False, index=True
    )
    channel: Mapped[str] = mapped_column(String, nullable=False)
    from_name: Mapped[str] = mapped_column(String, nullable=False)
    from_email: Mapped[str] = mapped_column(String, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    preview: Mapped[str] = mapped_column(String, default="")
    body: Mapped[str] = mapped_column(Text, default="")

    # AI classification
    intent: Mapped[str] = mapped_column(String, default="General Inquiry")
    intent_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    sentiment: Mapped[str] = mapped_column(String, default="Neutral")
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.5)

    status: Mapped[str] = mapped_column(String, default="open")
    assignee_id: Mapped[str | None] = mapped_column(String, nullable=True)
    assignee_name: Mapped[str | None] = mapped_column(String, nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    starred: Mapped[bool] = mapped_column(Boolean, default=False)
    unread: Mapped[bool] = mapped_column(Boolean, default=True)

    # Conversation thread: list of {id, authorName, authorRole, body, createdAt}
    thread: Mapped[list] = mapped_column(JSON, default=list)

    # Optional semantic embedding (pgvector in production; JSON on SQLite).
    embedding: Mapped[list | None] = mapped_column(JSON, nullable=True)


class Ticket(TimestampMixin, Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: new_id("tkt")
    )
    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id"), nullable=False, index=True
    )
    subject: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="open")
    priority: Mapped[str] = mapped_column(String, default="medium")
    intent: Mapped[str] = mapped_column(String, default="General Inquiry")
    assignee_name: Mapped[str | None] = mapped_column(String, nullable=True)
    message_id: Mapped[str | None] = mapped_column(
        ForeignKey("messages.id"), nullable=True
    )
