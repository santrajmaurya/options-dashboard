from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from app.api.health import router as health_router

from app.api.dashboard import (
    router as dashboard_router,
)

from app.core.config import settings


app = FastAPI(

    title=settings.app_name,

    version="1.0.0",

    description=(
        "Backend API for NIFTY "
        "Option Selling Dashboard"
    ),
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(
    health_router,
    prefix="/api",
    tags=["Health"],
)


app.include_router(
    dashboard_router,
    prefix="/api",
    tags=["Dashboard"],
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
async def root():

    return {

        "name": settings.app_name,

        "status": "running",

        "docs": "/docs",

        "dashboard": "/api/dashboard",
    }