from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select

from app.core.deps import CurrentUser, DbSession, require_roles
from app.models import User, Workflow, WorkflowRun
from app.schemas.workflow import (
    WorkflowIn,
    WorkflowOut,
    WorkflowRunOut,
    WorkflowStatusUpdate,
)
from app.services.audit import record_audit

router = APIRouter(tags=["workflows"])

EditorRoles = Depends(require_roles("Admin", "Manager", "Agent"))


def _owned(db, user, workflow_id: str) -> Workflow:
    wf = db.get(Workflow, workflow_id)
    if not wf or wf.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf


@router.get("/workflows", response_model=list[WorkflowOut])
def list_workflows(user: CurrentUser, db: DbSession):
    return db.scalars(
        select(Workflow)
        .where(Workflow.organization_id == user.organization_id)
        .order_by(desc(Workflow.created_at))
    ).all()


@router.get("/workflow-runs", response_model=list[WorkflowRunOut])
def list_runs(user: CurrentUser, db: DbSession):
    return db.scalars(
        select(WorkflowRun)
        .where(WorkflowRun.organization_id == user.organization_id)
        .order_by(desc(WorkflowRun.started_at))
        .limit(50)
    ).all()


@router.get("/workflows/{workflow_id}", response_model=WorkflowOut)
def get_workflow(workflow_id: str, user: CurrentUser, db: DbSession):
    return _owned(db, user, workflow_id)


@router.post("/workflows", response_model=WorkflowOut, status_code=status.HTTP_201_CREATED)
def create_workflow(payload: WorkflowIn, db: DbSession, user: User = EditorRoles):
    wf = Workflow(
        organization_id=user.organization_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        nodes=payload.nodes,
        edges=payload.edges,
    )
    db.add(wf)
    record_audit(db, user=user, action="workflow.create", resource_type="workflow")
    db.commit()
    db.refresh(wf)
    return wf


@router.put("/workflows/{workflow_id}", response_model=WorkflowOut)
def update_workflow(
    workflow_id: str, payload: WorkflowIn, db: DbSession, user: User = EditorRoles
):
    wf = _owned(db, user, workflow_id)
    wf.name = payload.name
    wf.description = payload.description
    wf.status = payload.status
    wf.nodes = payload.nodes
    wf.edges = payload.edges
    record_audit(db, user=user, action="workflow.update", resource_type="workflow", resource_id=workflow_id)
    db.commit()
    db.refresh(wf)
    return wf


@router.patch("/workflows/{workflow_id}/status", response_model=WorkflowOut)
def set_status(
    workflow_id: str,
    payload: WorkflowStatusUpdate,
    db: DbSession,
    user: User = EditorRoles,
):
    wf = _owned(db, user, workflow_id)
    wf.status = payload.status
    if payload.status == "active":
        wf.last_run_at = wf.last_run_at or datetime.now(timezone.utc)
    db.commit()
    db.refresh(wf)
    return wf
