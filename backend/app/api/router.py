from fastapi import APIRouter

from app.api import (
    ai,
    analytics,
    auth,
    contacts,
    messages,
    notifications,
    users,
    workflows,
)

# All API routes live under /api to match the frontend client + Vite proxy.
api_router = APIRouter(prefix="/api")

for module in (auth, users, messages, contacts, workflows, notifications, analytics, ai):
    api_router.include_router(module.router)
