from fastapi import APIRouter

from app.market.models import DashboardResponse

from app.services.dashboard_service import (
    dashboard_service,
)


router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
async def get_dashboard():

    return dashboard_service.get_dashboard()