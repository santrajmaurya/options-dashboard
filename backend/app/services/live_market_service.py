import asyncio
import logging
from typing import Any

from app.services.market_data.upstox_market_stream import UpstoxMarketStream


logger = logging.getLogger(__name__)


class LiveMarketService:
    """
    Broadcasts tick-driven Upstox V3 dashboard patches to frontend clients.

    Unlike the previous implementation, this class does NOT call
    DashboardService.get_dashboard() every two seconds.
    """

    def __init__(self):
        self.connections = set()
        self._task = None
        self._stream = UpstoxMarketStream(
            on_update=self.broadcast,
        )

    async def connect(self, websocket):
        await websocket.accept()
        self.connections.add(websocket)
        logger.info(
            "[LIVE] Dashboard client connected; clients=%s",
            len(self.connections),
        )
        await self.start()

    def disconnect(self, websocket):
        self.connections.discard(websocket)
        logger.info(
            "[LIVE] Dashboard client disconnected; clients=%s",
            len(self.connections),
        )

    async def start(self):
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(
                self._stream.run_forever()
            )

    async def stop(self):
        await self._stream.stop()

        if self._task and not self._task.done():
            self._task.cancel()

            try:
                await self._task
            except asyncio.CancelledError:
                pass

        self._task = None

    async def broadcast(self, payload: dict[str, Any]):
        if not self.connections:
            return

        logger.debug(
            "[LIVE] Broadcasting dashboard update to %s client(s)",
            len(self.connections),
        )

        dead = []

        for websocket in list(self.connections):
            try:
                await websocket.send_json(payload)
            except Exception:
                dead.append(websocket)

        for websocket in dead:
            self.disconnect(websocket)
