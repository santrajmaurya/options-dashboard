from fastapi import APIRouter

from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)

dashboard_service = DashboardService()


@router.get("")
async def get_dashboard():
    return dashboard_service.get_dashboard()