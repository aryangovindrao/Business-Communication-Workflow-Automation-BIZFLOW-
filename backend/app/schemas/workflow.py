from datetime import datetime
from typing import Any

from app.schemas.base import CamelModel


class WorkflowOut(CamelModel):
    id: str
    organization_id: str
    name: str
    description: str
    status: str
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    run_count: int
    success_rate: float
    created_at: datetime
    last_run_at: datetime | None = None


class WorkflowIn(CamelModel):
    """Payload from the builder (create or update)."""

    id: str | None = None
    name: str
    description: str = ""
    status: str = "draft"
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []


class WorkflowStatusUpdate(CamelModel):
    status: str


class WorkflowRunOut(CamelModel):
    id: str
    workflow_id: str
    workflow_name: str
    status: str
    trigger: str
    started_at: datetime
    duration_ms: int
