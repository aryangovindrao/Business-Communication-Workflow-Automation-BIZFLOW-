from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, new_id, utcnow


class Contact(TimestampMixin, Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: new_id("con")
    )
    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    company: Mapped[str] = mapped_column(String, default="")
    type: Mapped[str] = mapped_column(String, default="lead")  # lead | customer
    status: Mapped[str] = mapped_column(String, default="new")  # lead status
    value: Mapped[float] = mapped_column(Float, default=0.0)
    owner_name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    last_contact_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow
    )

    # Nested activity: lists of {id, type, summary, createdAt} / meetings
    interactions: Mapped[list] = mapped_column(JSON, default=list)
    meetings: Mapped[list] = mapped_column(JSON, default=list)
