from sqlalchemy.orm import Session

from app.models import AuditLog, User


def record_audit(
    db: Session,
    *,
    user: User | None,
    action: str,
    resource_type: str | None = None,
    resource_id: str | None = None,
    ip: str | None = None,
    organization_id: str | None = None,
) -> AuditLog:
    """Append an immutable audit-log entry. Caller commits."""
    log = AuditLog(
        organization_id=organization_id
        or (user.organization_id if user else "system"),
        user_id=user.id if user else None,
        user_name=user.name if user else None,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip=ip,
    )
    db.add(log)
    return log
