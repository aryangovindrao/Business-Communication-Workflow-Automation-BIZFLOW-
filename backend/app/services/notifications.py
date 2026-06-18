from sqlalchemy.orm import Session

from app.integrations.slack import send_slack
from app.models import Notification


def create_notification(
    db: Session,
    *,
    organization_id: str,
    type: str,
    title: str,
    body: str = "",
    channel: str = "in_app",
    dispatch: bool = True,
) -> Notification:
    """Persist an in-app notification and optionally fan out to Slack."""
    notification = Notification(
        organization_id=organization_id,
        type=type,
        title=title,
        body=body,
        channel=channel,
    )
    db.add(notification)

    if dispatch and channel == "slack":
        send_slack(f"*{title}*\n{body}")

    return notification
