from fastapi import APIRouter, HTTPException, status
from sqlalchemy import desc, select, update

from app.core.deps import CurrentUser, DbSession
from app.models import Notification
from app.schemas.system import NotificationOut

router = APIRouter(tags=["notifications"])


@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications(user: CurrentUser, db: DbSession):
    return db.scalars(
        select(Notification)
        .where(Notification.organization_id == user.organization_id)
        .order_by(desc(Notification.created_at))
    ).all()


@router.post("/notifications/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(notification_id: str, user: CurrentUser, db: DbSession):
    notification = db.get(Notification, notification_id)
    if not notification or notification.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.read = True
    db.commit()


@router.post("/notifications/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(user: CurrentUser, db: DbSession):
    db.execute(
        update(Notification)
        .where(Notification.organization_id == user.organization_id)
        .values(read=True)
    )
    db.commit()
