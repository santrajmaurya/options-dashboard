import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.live_market_service import LiveMarketService


logger = logging.getLogger(__name__)

router = APIRouter()

# One service instance means one upstream Upstox V3 connection is shared by
# all frontend /ws/dashboard clients handled by this process.
live_market_service = LiveMarketService()


@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await live_market_service.connect(websocket)

    try:
        # The frontend sends "subscribe" after connecting. We don't need to
        # parse it; receive_text simply keeps this endpoint alive and detects
        # disconnects while LiveMarketService broadcasts market patches.
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        logger.info("[WS] Dashboard WebSocket disconnected")
        live_market_service.disconnect(websocket)

    except Exception:
        live_market_service.disconnect(websocket)
        raise
