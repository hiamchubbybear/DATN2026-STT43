"""Structured JSON logging via structlog.

Uvicorn / FastAPI / stdlib loggers are routed through structlog so that every
line in production is a single JSON object that log aggregators can index.
"""

from __future__ import annotations

import logging
import sys
from typing import Any

import structlog


def configure_logging(level: str = "INFO", *, json_logs: bool = True) -> None:
    log_level = getattr(logging, level.upper(), logging.INFO)

    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True)

    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        timestamper,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    renderer: Any = (
        structlog.processors.JSONRenderer()
        if json_logs
        else structlog.dev.ConsoleRenderer(colors=True)
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(log_level)

    for noisy in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        logging.getLogger(noisy).handlers.clear()
        logging.getLogger(noisy).propagate = True


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    return structlog.stdlib.get_logger(name)
