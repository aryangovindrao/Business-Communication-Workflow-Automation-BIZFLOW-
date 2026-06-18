from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel

Role = str  # one of: Admin | Manager | Agent | Viewer


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class RegisterRequest(CamelModel):
    name: str = Field(min_length=1, max_length=120)
    organization_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(CamelModel):
    refresh_token: str


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ResetPasswordRequest(CamelModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


class MessageResponse(CamelModel):
    message: str
    # Populated only in development so the reset flow is testable without SMTP.
    reset_token: str | None = None


class TokenResponse(CamelModel):
    access_token: str


class OrganizationOut(CamelModel):
    id: str
    name: str
    plan: str


class UserOut(CamelModel):
    id: str
    organization_id: str
    name: str
    email: EmailStr
    role: Role
    status: str
    avatar_url: str | None = None
    last_active: datetime | None = None


class AuthSession(CamelModel):
    user: UserOut
    organization: OrganizationOut
    access_token: str
    refresh_token: str


class RoleUpdate(CamelModel):
    role: Role
