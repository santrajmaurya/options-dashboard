import asyncio
import json
import logging
import uuid
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone, time
from zoneinfo import ZoneInfo
from typing import Any

import requests
import websockets

from app.config import settings
from app.services.market_data.proto import MarketDataFeedV3_pb2


logger = logging.getLogger(__name__)

UpdateCallback = Callable[[dict[str, Any]], Awaitable[None]]


class UpstoxMarketStream:
    """
    Persistent Upstox Market Data Feed V3 client.

    The stream subscribes to NIFTY 50, India VIX and configured sector indices
    in LTPC mode. Incoming Protobuf ticks are converted into small dashboard
    patches and passed to `on_update`.

    REST remains responsible for the initial complete dashboard snapshot.
    """

    def __init__(self, on_update: UpdateCallback):
        if not settings.UPSTOX_ACCESS_TOKEN:
            raise RuntimeError("UPSTOX_ACCESS_TOKEN is not configured.")

        self.on_update = on_update
        self._stop_event = asyncio.Event()
        self.feed_state = "CONNECTING"
        self.last_tick_at = None
        self._simulated_ltp = 24238.50

        self.instrument_keys = self._build_instrument_keys()
        self.sector_key_to_name = {
            key: name
            for name, key in settings.UPSTOX_SECTOR_INSTRUMENTS.items()
            if key
        }

    def _build_instrument_keys(self) -> list[str]:
        keys = [
            settings.UPSTOX_NIFTY_INSTRUMENT_KEY,
            settings.UPSTOX_VIX_INSTRUMENT_KEY,
            *settings.UPSTOX_SECTOR_INSTRUMENTS.values(),
        ]

        # Preserve order while removing blanks and duplicates.
        return list(dict.fromkeys(key for key in keys if key))

    async def run_forever(self):
        retry_seconds = settings.UPSTOX_STREAM_RECONNECT_SECONDS

        if settings.UPSTOX_STREAM_SIMULATION:
            logger.warning("[UPSTOX] SIMULATION MODE enabled; no live Upstox connection will be used")
            await self._run_simulation()
            return

        logger.info(
            "[UPSTOX] Starting Market Data Feed V3 for %s instruments",
            len(self.instrument_keys),
        )

        while not self._stop_event.is_set():
            try:
                logger.info("[UPSTOX] Requesting authorized WebSocket URL")
                authorized_url = await asyncio.to_thread(
                    self._get_authorized_websocket_url
                )

                self.feed_state = "CONNECTING"
                await self._emit_feed_state()
                logger.info("[UPSTOX] Authorization successful")
                logger.info(
                    "[UPSTOX] Connecting to Market Data Feed V3 for %s instruments",
                    len(self.instrument_keys),
                )

                async with websockets.connect(
                    authorized_url,
                    ping_interval=20,
                    ping_timeout=20,
                    close_timeout=10,
                    max_size=None,
                ) as websocket:
                    self.feed_state = "LIVE"
                    await self._emit_feed_state()
                    logger.info("[UPSTOX] WebSocket connected")
                    await self._subscribe(websocket)
                    logger.info("[UPSTOX] Subscription sent")
                    retry_seconds = settings.UPSTOX_STREAM_RECONNECT_SECONDS

                    async for message in websocket:
                        if self._stop_event.is_set():
                            break

                        if not isinstance(message, (bytes, bytearray)):
                            continue

                        logger.debug(
                            "[UPSTOX] Feed message received: %s bytes",
                            len(message),
                        )
                        patch = self._decode_message(bytes(message))

                        if patch:
                            self.last_tick_at = datetime.now(timezone.utc)
                            patch.setdefault("market", {})["feed_state"] = "LIVE"
                            patch["market"]["market_status"] = self._market_status()
                            patch["market"]["last_tick_at"] = self.last_tick_at.isoformat()
                            await self.on_update(patch)

            except asyncio.CancelledError:
                raise
            except Exception:
                self.feed_state = "DISCONNECTED"
                await self._emit_feed_state()
                logger.exception(
                    "Upstox V3 stream disconnected; reconnecting in %s seconds",
                    retry_seconds,
                )

                try:
                    await asyncio.wait_for(
                        self._stop_event.wait(),
                        timeout=retry_seconds,
                    )
                except asyncio.TimeoutError:
                    pass

                retry_seconds = min(retry_seconds * 2, 30)

    @staticmethod
    def _market_status() -> str:
        """Return the current NSE market status using IST."""
        now = datetime.now(ZoneInfo("Asia/Kolkata"))

        if now.weekday() >= 5:
            return "MARKET CLOSED"

        current_time = now.time()

        if time(9, 0) <= current_time < time(9, 15):
            return "PRE-MARKET"

        if time(9, 15) <= current_time <= time(15, 30):
            return "MARKET OPEN"

        return "MARKET CLOSED"

    async def _emit_feed_state(self):
        await self.on_update(
            {
                "type": "market_update",
                "market": {
                    "feed_state": self.feed_state,
                    "market_status": self._market_status(),
                    "last_tick_at": (
                        self.last_tick_at.isoformat()
                        if self.last_tick_at
                        else None
                    ),
                },
            }
        )

    async def _run_simulation(self):
        self.feed_state = "LIVE"
        await self._emit_feed_state()

        direction = 1

        while not self._stop_event.is_set():
            self._simulated_ltp += direction * 1.25

            if abs(self._simulated_ltp - 24238.50) >= 10:
                direction *= -1

            self.last_tick_at = datetime.now(timezone.utc)
            previous_close = 24334.30
            change = self._simulated_ltp - previous_close

            await self.on_update(
                {
                    "type": "market_update",
                    "market": {
                        "timestamp": self.last_tick_at.isoformat(),
                        "last_tick_at": self.last_tick_at.isoformat(),
                        "feed_state": "LIVE",
                        "market_status": self._market_status(),
                        "simulated": True,
                    },
                    "nifty": {
                        "ltp": round(self._simulated_ltp, 2),
                        "previous_close": previous_close,
                        "change": round(change, 2),
                        "change_percent": round(
                            (change / previous_close) * 100,
                            2,
                        ),
                    },
                }
            )

            await asyncio.sleep(
                settings.UPSTOX_STREAM_SIMULATION_INTERVAL_SECONDS
            )

    async def stop(self):
        self._stop_event.set()

    def _get_authorized_websocket_url(self) -> str:
        url = (
            f"{settings.UPSTOX_API_BASE_URL}"
            "/v3/feed/market-data-feed/authorize"
        )

        response = requests.get(
            url,
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {settings.UPSTOX_ACCESS_TOKEN}",
            },
            timeout=10,
        )
        response.raise_for_status()

        payload = response.json()

        if payload.get("status") != "success":
            raise RuntimeError(
                f"Upstox market feed authorization failed: {payload}"
            )

        authorized_url = (
            payload.get("data", {}).get("authorized_redirect_uri")
        )

        if not authorized_url:
            raise RuntimeError(
                "Upstox did not return authorized_redirect_uri."
            )

        return authorized_url

    async def _subscribe(self, websocket):
        request = {
            "guid": str(uuid.uuid4()),
            "method": "sub",
            "data": {
                "mode": "ltpc",
                "instrumentKeys": self.instrument_keys,
            },
        }

        # Upstox V3 requires the subscription request as a binary frame.
        logger.info(
            "[UPSTOX] Subscribing to %s instruments",
            len(self.instrument_keys),
        )
        await websocket.send(
            json.dumps(request).encode("utf-8")
        )

    def _decode_message(self, raw_message: bytes) -> dict[str, Any] | None:
        response = MarketDataFeedV3_pb2.FeedResponse()
        response.ParseFromString(raw_message)

        if not response.feeds:
            # The first V3 message can contain market status only.
            return None

        patch: dict[str, Any] = {
            "type": "market_update",
            "market": {
                "timestamp": self._timestamp_to_iso(response.currentTs),
            },
        }

        sectors: list[dict[str, Any]] = []

        for instrument_key, feed in response.feeds.items():
            ltpc = self._extract_ltpc(feed)

            if ltpc is None:
                continue

            ltp = float(ltpc.ltp)
            previous_close = float(ltpc.cp)
            change = ltp - previous_close if previous_close else 0.0
            change_percent = (
                change / previous_close * 100
                if previous_close
                else 0.0
            )

            values = {
                "ltp": ltp,
                "previous_close": previous_close,
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
            }

            if instrument_key == settings.UPSTOX_NIFTY_INSTRUMENT_KEY:
                patch["nifty"] = values

            elif instrument_key == settings.UPSTOX_VIX_INSTRUMENT_KEY:
                patch["vix"] = {
                    "value": ltp,
                    "previous": previous_close,
                    "change": round(change, 2),
                    "change_percent": round(change_percent, 2),
                }

            elif instrument_key in self.sector_key_to_name:
                sectors.append({
                    "name": self.sector_key_to_name[instrument_key],
                    "instrument_key": instrument_key,
                    **values,
                    "direction": "UP" if change >= 0 else "DOWN",
                })

        if sectors:
            patch["sectors"] = sectors

        if len(patch) <= 2 and "nifty" not in patch and "vix" not in patch:
            return None

        return patch

    @staticmethod
    def _extract_ltpc(feed):
        union_name = feed.WhichOneof("FeedUnion")

        if union_name == "ltpc":
            return feed.ltpc

        if union_name == "firstLevelWithGreeks":
            return feed.firstLevelWithGreeks.ltpc

        if union_name == "fullFeed":
            full_union = feed.fullFeed.WhichOneof("FullFeedUnion")

            if full_union == "marketFF":
                return feed.fullFeed.marketFF.ltpc

            if full_union == "indexFF":
                return feed.fullFeed.indexFF.ltpc

        return None

    @staticmethod
    def _timestamp_to_iso(timestamp_ms: int) -> str:
        if not timestamp_ms:
            return datetime.now(timezone.utc).isoformat()

        return datetime.fromtimestamp(
            timestamp_ms / 1000,
            tz=timezone.utc,
        ).isoformat()
