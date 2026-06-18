from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "bizflow",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
)

# Celery Beat — periodic jobs.
celery_app.conf.beat_schedule = {
    "daily-report": {
        "task": "app.workers.tasks.generate_daily_report",
        "schedule": crontab(hour=8, minute=0),
    },
    "hourly-followups": {
        "task": "app.workers.tasks.run_followups",
        "schedule": crontab(minute=0),
    },
    "nightly-crm-sync": {
        "task": "app.workers.tasks.sync_crm",
        "schedule": crontab(hour=2, minute=30),
    },
}
