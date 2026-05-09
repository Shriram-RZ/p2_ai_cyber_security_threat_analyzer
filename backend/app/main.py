"""FastAPI entry-point for the AI Cyber Threat Analyzer."""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import Base, engine
from app.api.routes_auth import router as auth_router
from app.api.routes_threat import router as threat_router
from app.api.routes_phishing import router as phishing_router
from app.api.routes_malware import router as malware_router
from app.api.routes_chat import router as chat_router
from app.api.routes_dashboard import router as dashboard_router
from app.api.routes_intel import router as intel_router

# Ensure all models are imported so that metadata is registered.
from app import models  # noqa: F401

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
log = logging.getLogger("app")

app = FastAPI(
    title="AI Cyber Threat Analyzer",
    description="AI-powered cybersecurity intelligence platform.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

origins = [settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({o for o in origins if o}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    log.info("Database tables created/verified.")


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "ai-cyber-threat-analyzer", "version": "1.0.0"}


@app.get("/", include_in_schema=False)
def root():
    return JSONResponse({"name": "AI Cyber Threat Analyzer API", "docs": "/api/docs"})


# Register routers under /api
PREFIX = "/api"
for r in (
    auth_router,
    threat_router,
    phishing_router,
    malware_router,
    chat_router,
    dashboard_router,
    intel_router,
):
    app.include_router(r, prefix=PREFIX)
