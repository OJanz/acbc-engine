from lettermint import AsyncLettermint

from app.core.config import settings

_client: AsyncLettermint | None = None


def _get_client() -> AsyncLettermint:
    global _client
    if _client is None:
        _client = AsyncLettermint(api_token=settings.LETTERMINT_API_KEY)
    return _client


async def send_verification_email(email: str, token: str) -> None:
    verify_url = f"{settings.FRONTEND_URL}/auth/verify?token={token}"
    await (
        _get_client()
        .from_(settings.MAIL_FROM)
        .to(email)
        .subject("E-Mail-Adresse bestätigen – ACBC Survey Engine")
        .text(
            f"Bitte bestätige deine E-Mail-Adresse, indem du auf folgenden Link klickst:\n\n"
            f"{verify_url}\n\n"
            "Der Link ist 24 Stunden gültig."
        )
        .send()
    )


async def send_password_reset_email(email: str, token: str) -> None:
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    await (
        _get_client()
        .from_(settings.MAIL_FROM)
        .to(email)
        .subject("Passwort zurücksetzen – ACBC Survey Engine")
        .text(
            f"Du hast eine Passwort-Zurücksetzen-Anfrage gestellt.\n\n"
            f"Klicke auf folgenden Link, um dein Passwort zurückzusetzen:\n\n"
            f"{reset_url}\n\n"
            "Der Link ist 1 Stunde gültig. Falls du keine Anfrage gestellt hast, ignoriere diese E-Mail."
        )
        .send()
    )
