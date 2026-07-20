from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.dashboard_service import DashboardService
from app.services.live_market_service import LiveMarketService


router = APIRouter()

dashboard_service = DashboardService()

live_market_service = LiveMarketService(
    dashboard_service=dashboard_service,
    refresh_seconds=2.0,
)


@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await live_market_service.connect(websocket)
    await live_market_service.start()

    try:
        # Keep the socket endpoint alive. Updates are broadcast by the
        # LiveMarketService background task.
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        live_market_service.disconnect(websocket)
    except Exception:
        live_market_service.disconnect(websocket)
