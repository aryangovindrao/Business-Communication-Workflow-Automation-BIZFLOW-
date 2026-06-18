from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.core.deps import CurrentUser, DbSession
from app.core.rate_limit import limiter
from app.core.security import (
    REFRESH,
    RESET,
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.integrations.email import send_email
from app.models import Organization, User
from app.schemas.auth import (
    AuthSession,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.services.audit import record_audit

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_session(db, user: User) -> AuthSession:
    org = db.get(Organization, user.organization_id)
    claims = {"org": user.organization_id, "role": user.role}
    return AuthSession(
        user=user,
        organization=org,
        access_token=create_access_token(user.id, **claims),
        refresh_token=create_refresh_token(user.id, **claims),
    )


@router.post("/login", response_model=AuthSession)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: DbSession):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    user.last_active = datetime.now(timezone.utc)
    record_audit(
        db,
        user=user,
        action="auth.login",
        ip=request.client.host if request.client else None,
    )
    db.commit()
    db.refresh(user)
    return _issue_session(db, user)


@router.post("/register", response_model=AuthSession, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: DbSession):
    """Create a new tenant (organization) with the signer as its Admin."""
    email = payload.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    org = Organization(name=payload.organization_name.strip(), plan="free")
    db.add(org)
    db.flush()  # assign org.id

    user = User(
        organization_id=org.id,
        name=payload.name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
        role="Admin",
        status="active",
        last_active=datetime.now(timezone.utc),
    )
    db.add(user)
    record_audit(
        db,
        user=user,
        action="auth.register",
        resource_type="organization",
        resource_id=org.id,
        ip=request.client.host if request.client else None,
    )
    db.commit()
    db.refresh(user)
    return _issue_session(db, user)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("5/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: DbSession):
    """Email a reset link. Always 200 — never reveals whether the email exists."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    dev_token = None
    if user:
        token = create_reset_token(user.id)
        base = settings.cors_origins_list[0] if settings.cors_origins_list else ""
        link = f"{base}/reset-password?token={token}"
        send_email(
            user.email,
            "Reset your BizFlow password",
            f"Use this link to reset your password (valid 30 minutes):\n{link}",
        )
        record_audit(
            db,
            user=user,
            action="auth.forgot_password",
            ip=request.client.host if request.client else None,
        )
        db.commit()
        if settings.env.lower() in ("development", "dev"):
            dev_token = token  # convenience for testing without SMTP configured
    return MessageResponse(
        message="If an account exists for that email, a reset link has been sent.",
        reset_token=dev_token,
    )


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: DbSession):
    try:
        claims = decode_token(payload.token)
        if claims.get("type") != RESET:
            raise ValueError("not a reset token")
        user_id = claims["sub"]
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link",
        )
    user.hashed_password = hash_password(payload.password)
    record_audit(
        db,
        user=user,
        action="auth.reset_password",
        ip=request.client.host if request.client else None,
    )
    db.commit()
    return MessageResponse(message="Your password has been reset. You can now sign in.")


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: DbSession):
    try:
        claims = decode_token(payload.refresh_token)
        if claims.get("type") != REFRESH:
            raise ValueError("not a refresh token")
        user_id = claims["sub"]
    except (jwt.PyJWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown user")
    return TokenResponse(
        access_token=create_access_token(
            user.id, org=user.organization_id, role=user.role
        )
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(user: CurrentUser, db: DbSession):
    record_audit(db, user=user, action="auth.logout")
    db.commit()
