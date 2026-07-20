import asyncio
from datetime import datetime, timezone
from typing import Any


class LiveMarketService:
    """
    Lightweight WebSocket broadcaster.

    The existing /api/dashboard endpoint remains the source of truth.
    This service periodically obtains a fresh DashboardResponse and pushes
    it to connected frontend clients.

    This is intentionally provider-agnostic: DashboardService can continue
    using your existing UpstoxMarketDataProvider.
    """

    def __init__(self, dashboard_service, refresh_seconds: float = 2.0):
        self.dashboard_service = dashboard_service
        self.refresh_seconds = refresh_seconds
        self.connections = set()
        self._task = None

    async def connect(self, websocket):
        await websocket.accept()
        self.connections.add(websocket)

    def disconnect(self, websocket):
        self.connections.discard(websocket)

    async def start(self):
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._run())

    async def stop(self):
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self._task = None

    async def _run(self):
        while True:
            if self.connections:
                try:
                    # DashboardService is synchronous in the current project.
                    dashboard = await asyncio.to_thread(
                        self.dashboard_service.get_dashboard
                    )

                    if hasattr(dashboard, "model_dump"):
                        payload = dashboard.model_dump(mode="json")
                    elif isinstance(dashboard, dict):
                        payload = dashboard
                    else:
                        payload = dict(dashboard)

                    payload["live_received_at"] = (
                        datetime.now(timezone.utc).isoformat()
                    )

                    await self.broadcast(payload)
                except Exception as exc:
                    # Keep the live loop alive if one Upstox/API request fails.
                    await self.broadcast({
                        "type": "error",
                        "message": str(exc),
                        "live_received_at": datetime.now(
                            timezone.utc
                        ).isoformat(),
                    })

            await asyncio.sleep(self.refresh_seconds)

    async def broadcast(self, payload: dict[str, Any]):
        dead = []

        for websocket in list(self.connections):
            try:
                await websocket.send_json(payload)
            except Exception:
                dead.append(websocket)

        for websocket in dead:
            self.disconnect(websocket)
