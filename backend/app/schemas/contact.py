from datetime import datetime
from typing import Any

from pydantic import EmailStr

from app.schemas.base import CamelModel


class ContactOut(CamelModel):
    id: str
    organization_id: str
    name: str
    email: EmailStr
    phone: str | None = None
    company: str
    type: str
    status: str
    value: float
    owner_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    last_contact_at: datetime
    interactions: list[dict[str, Any]] = []
    meetings: list[dict[str, Any]] = []


class ContactCreate(CamelModel):
    name: str
    email: EmailStr
    company: str = ""
    phone: str | None = None
    type: str = "lead"
    status: str = "new"
    value: float = 0.0
    owner_name: str | None = None


class LeadStatusUpdate(CamelModel):
    status: str
