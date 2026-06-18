from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import ACCESS, decode_token
from app.models import User

bearer = HTTPBearer(auto_error=True)

DbSession = Annotated[Session, Depends(get_db)]

_credentials_error = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
    db: DbSession,
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != ACCESS:
            raise _credentials_error
        user_id = payload.get("sub")
    except jwt.PyJWTError:
        raise _credentials_error

    user = db.get(User, user_id)
    if user is None or user.status == "disabled":
        raise _credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: str):
    """Dependency factory enforcing RBAC — user.role must be in `roles`."""

    def checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(roles)}",
            )
        return user

    return checker
