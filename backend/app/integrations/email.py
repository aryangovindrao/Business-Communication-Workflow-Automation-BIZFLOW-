import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

log = logging.getLogger("bizflow.email")


def send_email(to: str, subject: str, body: str) -> bool:
    """Send email via Gmail SMTP (or any SMTP). No-op (logs) if unconfigured."""
    if not settings.smtp_host:
        log.info("[email:noop] to=%s subject=%s", to, subject)
        return False
    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return True
    except (smtplib.SMTPException, OSError) as exc:  # pragma: no cover
        log.warning("Email delivery failed: %s", exc)
        return False
