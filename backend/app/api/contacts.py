from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import desc, or_, select

from app.core.deps import CurrentUser, DbSession
from app.models import Contact
from app.schemas.contact import ContactCreate, ContactOut, LeadStatusUpdate
from app.services.audit import record_audit

router = APIRouter(tags=["contacts"])


def _owned(db, user, contact_id: str) -> Contact:
    contact = db.get(Contact, contact_id)
    if not contact or contact.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.get("/contacts", response_model=list[ContactOut])
def list_contacts(
    user: CurrentUser,
    db: DbSession,
    type: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    stmt = select(Contact).where(Contact.organization_id == user.organization_id)
    if type and type != "all":
        stmt = stmt.where(Contact.type == type)
    if status and status != "all":
        stmt = stmt.where(Contact.status == status)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            or_(
                Contact.name.ilike(like),
                Contact.company.ilike(like),
                Contact.email.ilike(like),
            )
        )
    return db.scalars(stmt.order_by(desc(Contact.last_contact_at))).all()


@router.get("/contacts/{contact_id}", response_model=ContactOut)
def get_contact(contact_id: str, user: CurrentUser, db: DbSession):
    return _owned(db, user, contact_id)


@router.patch("/contacts/{contact_id}/status", response_model=ContactOut)
def update_lead_status(
    contact_id: str, payload: LeadStatusUpdate, user: CurrentUser, db: DbSession
):
    contact = _owned(db, user, contact_id)
    contact.status = payload.status
    if payload.status == "won":
        contact.type = "customer"
    record_audit(
        db, user=user, action="contact.status", resource_type="contact", resource_id=contact_id
    )
    db.commit()
    db.refresh(contact)
    return contact


@router.post("/contacts", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, user: CurrentUser, db: DbSession):
    now = datetime.now(timezone.utc)
    contact = Contact(
        organization_id=user.organization_id,
        name=payload.name,
        email=payload.email,
        company=payload.company,
        phone=payload.phone,
        type=payload.type,
        status=payload.status,
        value=payload.value,
        owner_name=payload.owner_name,
        last_contact_at=now,
        interactions=[],
        meetings=[],
    )
    db.add(contact)
    record_audit(db, user=user, action="contact.create", resource_type="contact")
    db.commit()
    db.refresh(contact)
    return contact
