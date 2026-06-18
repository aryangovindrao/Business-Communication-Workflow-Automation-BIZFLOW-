import logging

import requests

from app.core.config import settings

log = logging.getLogger("bizflow.slack")


def send_slack(text: str, channel: str | None = None) -> bool:
    """Post to Slack via incoming webhook. No-op (logs) if unconfigured."""
    if not settings.slack_webhook_url:
        log.info("[slack:noop] %s", text)
        return False
    try:
        payload: dict = {"text": text}
        if channel:
            payload["channel"] = channel
        requests.post(settings.slack_webhook_url, json=payload, timeout=10)
        return True
    except requests.RequestException as exc:  # pragma: no cover
        log.warning("Slack delivery failed: %s", exc)
        return False
