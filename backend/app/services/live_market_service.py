import asyncio
import logging
from typing import Any

from app.services.market_data.upstox_market_stream import UpstoxMarketStream
from app.services.market_data import get_market_data_provider
from app.config import settings


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
        await websocket.send_json({
            "type": "market_update",
            "market": {
                "feed_state": self._stream.feed_state,
                "market_status": self._stream._market_status(),
                "last_tick_at": (
                    self._stream.last_tick_at.isoformat()
                    if self._stream.last_tick_at else None
                ),
            },
        })
        # Seed the watchlist from REST immediately. This is important after
        # market close, when index WebSocket ticks may no longer arrive.
        try:
            provider = get_market_data_provider()
            def build_watchlist():
                bank_key = provider.resolve_index_key(settings.UPSTOX_NIFTY_BANK_INSTRUMENT_KEY, ["Nifty Bank", "NIFTY BANK", "BANKNIFTY"]) if hasattr(provider, "resolve_index_key") else settings.UPSTOX_NIFTY_BANK_INSTRUMENT_KEY
                fin_key = provider.resolve_index_key(settings.UPSTOX_FINNIFTY_INSTRUMENT_KEY, ["Nifty Fin Service", "Nifty Financial Services", "NIFTY FIN SERVICE", "FINNIFTY"]) if hasattr(provider, "resolve_index_key") else settings.UPSTOX_FINNIFTY_INSTRUMENT_KEY
                mapping = {
                    "NIFTY": settings.UPSTOX_NIFTY_INSTRUMENT_KEY,
                    "BANKNIFTY": bank_key,
                    "FINNIFTY": fin_key,
                    "INDIA VIX": settings.UPSTOX_VIX_INSTRUMENT_KEY,
                }
                quotes = provider._get_quotes(list(mapping.values()))
                result = {}
                for name, key in mapping.items():
                    q = provider._find_quote(quotes, key)
                    if not q:
                        continue
                    ltp = provider._to_float(q.get("last_price"))
                    cp = provider._to_float((q.get("ohlc") or {}).get("close"))
                    change = provider._to_float(q.get("net_change"), default=ltp-cp)
                    result[name] = {"ltp": ltp, "previous_close": cp,
                        "change": round(change,2),
                        "change_percent": round(change/cp*100,2) if cp else 0.0}
                return result
            watchlist = await asyncio.to_thread(build_watchlist)
            if watchlist:
                await websocket.send_json({"type":"market_update", "watchlist":watchlist})
        except Exception:
            logger.exception("[LIVE] Unable to seed watchlist from REST")

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
