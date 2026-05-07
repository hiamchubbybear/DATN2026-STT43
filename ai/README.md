# `ai/` — DATN2026-STT43 Scam-Detection Service

> Internal-only FastAPI service that scores chat messages, profiles and
> accounts for romance-scam patterns. See [`../AI_PLAN.md`](../AI_PLAN.md)
> for the full spec.

This is the **walking-skeleton scaffold** (Sprint E1, step 1). Subsequent
commits add the Tier 0 detectors, then Tier 1 ML models. The HTTP surface
described in `AI_PLAN.md §5` is locked in here so that the .NET backend can
start integrating against a stub.

## Local development

Requires Python 3.11.

```bash
cd ai
python -m venv .venv
.\.venv\Scripts\Activate.ps1     # PowerShell
# source .venv/bin/activate      # bash/zsh
pip install -e ".[dev]"
copy .env.example .env           # then edit AI_INTERNAL_TOKEN
uvicorn app.main:app --reload --port 8000
```

Then:

```bash
curl http://localhost:8000/healthz
curl http://localhost:8000/version
```

## Tests / lint / type-check

```bash
pytest
ruff check .
ruff format --check .
mypy app
```

## Docker

The Docker build context **must be the `ai/` directory itself**:

```bash
docker build -t datn-ai:local ai
docker run --rm -p 8000:8000 -e AI_INTERNAL_TOKEN=dev-token datn-ai:local
```

## Endpoints

| Method | Path                  | Auth              | Status   |
|--------|-----------------------|-------------------|----------|
| GET    | `/healthz`            | public            | live     |
| GET    | `/readyz`             | public            | live     |
| GET    | `/version`            | public            | live     |
| POST   | `/v1/score/message`   | `X-Internal-Token`| TODO E1 |
| POST   | `/v1/score/profile`   | `X-Internal-Token`| TODO E3 |
| POST   | `/v1/score/account`   | `X-Internal-Token`| TODO E4 |

## Configuration (env vars)

All config is loaded by `pydantic-settings` from environment variables with
the prefix `AI_`. See [`.env.example`](.env.example).

| Variable             | Default         | Notes                                |
|----------------------|-----------------|--------------------------------------|
| `AI_ENV`             | `development`   | `development` \| `staging` \| `production` |
| `AI_HOST`            | `0.0.0.0`       |                                      |
| `AI_PORT`            | `8000`          |                                      |
| `AI_LOG_LEVEL`       | `INFO`          |                                      |
| `AI_INTERNAL_TOKEN`  | _required_      | Shared secret with the .NET backend  |
| `AI_REDIS_URL`       | _unset_         | e.g. `redis://redis:6379/0`          |
| `AI_RULES_VERSION`   | `rules-v1`      | Surfaced in `/version`               |
