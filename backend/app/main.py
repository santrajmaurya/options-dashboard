from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.websocket import router as websocket_router


app = FastAPI(
    title="NIFTY Option Selling Dashboard API",
    description="Backend API for NIFTY Market Regime and Option Selling Dashboard",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# ROUTERS
# ---------------------------------------------------------

app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(websocket_router)


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "NIFTY Option Selling Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "dashboard": "/api/dashboard",
    }