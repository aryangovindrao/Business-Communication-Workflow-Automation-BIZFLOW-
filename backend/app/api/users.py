from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import CurrentUser, DbSession, require_roles
from app.models import User
from app.schemas.auth import RoleUpdate, UserOut
from app.services.audit import record_audit

router = APIRouter(tags=["users"])


@router.get("/users", response_model=list[UserOut])
def list_users(user: CurrentUser, db: DbSession):
    return (
        db.query(User)
        .filter(User.organization_id == user.organization_id)
        .order_by(User.created_at)
        .all()
    )


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_role(
    user_id: str,
    payload: RoleUpdate,
    db: DbSession,
    admin: User = Depends(require_roles("Admin")),
):
    target = db.get(User, user_id)
    if not target or target.organization_id != admin.organization_id:
        raise HTTPException(status_code=404, detail="User not found")
    target.role = payload.role
    record_audit(
        db, user=admin, action="user.role_update", resource_type="user", resource_id=user_id
    )
    db.commit()
    db.refresh(target)
    return target
