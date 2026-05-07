"""Internal-token middleware.

Every ``/v1/*`` request must carry the ``X-Internal-Token`` header set to the
value of ``AI_INTERNAL_TOKEN``. Liveness probes (``/healthz``, ``/readyz``)
and ``/version`` are intentionally exempt so that K8s and humans can observe
the service without the secret.
"""

from __future__ import annotations

import secrets

from fastapi import Header, HTTPException, status

from app.core.config import Settings, get_settings

INTERNAL_TOKEN_HEADER = "X-Internal-Token"


async def require_internal_token(
    x_internal_token: str | None = Header(default=None, alias=INTERNAL_TOKEN_HEADER),
) -> None:
    settings: Settings = get_settings()
    expected = settings.internal_token

    if not expected:
        # No token configured — only tolerated outside production. ``get_settings``
        # already refuses to start in production with an empty token.
        return

    if x_internal_token is None or not secrets.compare_digest(x_internal_token, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal token.",
            headers={"WWW-Authenticate": "InternalToken"},
        )
