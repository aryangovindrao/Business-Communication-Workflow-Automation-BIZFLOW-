"""SQLAlchemy models. Importing this package registers all tables on Base."""

from app.models.communication import Message, Ticket
from app.models.crm import Contact
from app.models.organization import Organization, Role
from app.models.system import AnalyticsEvent, AuditLog, Notification
from app.models.user import User
from app.models.workflow import Workflow, WorkflowRun

__all__ = [
    "Organization",
    "Role",
    "User",
    "Message",
    "Ticket",
    "Contact",
    "Workflow",
    "WorkflowRun",
    "Notification",
    "AnalyticsEvent",
    "AuditLog",
]
