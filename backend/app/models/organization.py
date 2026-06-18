from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin, new_id


class Organization(TimestampMixin, Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: new_id("org")
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    plan: Mapped[str] = mapped_column(String, default="free", nullable=False)


class Role(TimestampMixin, Base):
    """RBAC role reference data (scoped per organization)."""

    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: new_id("role")
    )
    organization_id: Mapped[str | None] = mapped_column(
        ForeignKey("organizations.id"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    permissions: Mapped[list] = mapped_column(JSON, default=list)
