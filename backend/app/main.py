import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import app.models  # noqa: F401  (registers all tables on Base.metadata)
from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.rate_limit import limiter
from app.db.seed import seed_demo_data

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("bizflow")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Dev convenience: create tables (use Alembic migrations in production).
    Base.metadata.create_all(bind=engine)
    if settings.seed_on_startup:
        with SessionLocal() as db:
            seed_demo_data(db)
    log.info("BizFlow API ready (env=%s, db=%s)", settings.env, settings.database_url)
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI-Powered Business Communication Workflow Automation Platform",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name, "version": "0.1.0"}


@app.get("/", tags=["health"])
def root() -> dict:
    return {"message": "BizFlow API", "docs": "/docs", "health": "/health"}
