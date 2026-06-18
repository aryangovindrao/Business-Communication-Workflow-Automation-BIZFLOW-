from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from app.core.config import settings

ACCESS = "access"
REFRESH = "refresh"
RESET = "reset"


# ── Password hashing (bcrypt, 72-byte input cap) ─────────────
def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8")[:72], hashed.encode("utf-8")
        )
    except (ValueError, TypeError):
        return False


# ── JWT ──────────────────────────────────────────────────────
def _create_token(
    subject: str, token_type: str, expires_delta: timedelta, **extra: Any
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        **extra,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(subject: str, **extra: Any) -> str:
    return _create_token(
        subject,
        ACCESS,
        timedelta(minutes=settings.access_token_expire_minutes),
        **extra,
    )


def create_refresh_token(subject: str, **extra: Any) -> str:
    return _create_token(
        subject,
        REFRESH,
        timedelta(days=settings.refresh_token_expire_days),
        **extra,
    )


def create_reset_token(subject: str) -> str:
    """Short-lived (30 min) single-purpose password-reset token."""
    return _create_token(subject, RESET, timedelta(minutes=30))


def decode_token(token: str) -> dict[str, Any]:
    """Decode/verify a JWT. Raises jwt.PyJWTError on failure."""
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
