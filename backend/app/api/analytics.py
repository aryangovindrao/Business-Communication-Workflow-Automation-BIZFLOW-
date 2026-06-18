from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.system import AnalyticsData
from app.services.analytics import build_analytics

router = APIRouter(tags=["analytics"])


@router.get("/analytics/summary", response_model=AnalyticsData)
def analytics_summary(user: CurrentUser, db: DbSession):
    return build_analytics(db, user.organization_id)
