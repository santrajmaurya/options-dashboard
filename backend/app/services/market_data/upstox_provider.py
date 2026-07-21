from urllib.parse import quote
import json
import gzip
from pathlib import Path
from datetime import date

import requests

from app.config import settings

from .base import (
    IndexSnapshot,
    MarketCandle,
    MarketDataProvider,
    SectorSnapshot,
    VixSnapshot,
)


class UpstoxMarketDataProvider(MarketDataProvider):

    def __init__(self):
        if not settings.UPSTOX_ACCESS_TOKEN:
            raise RuntimeError(
                "UPSTOX_ACCESS_TOKEN is not configured."
            )

        self.base_url = settings.UPSTOX_API_BASE_URL
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Accept": "application/json",
                "Authorization": (
                    f"Bearer {settings.UPSTOX_ACCESS_TOKEN}"
                ),
            }
        )

    def get_nifty_snapshot(self) -> IndexSnapshot:
        quote_data = self._get_quote(
            settings.UPSTOX_NIFTY_INSTRUMENT_KEY
        )
        last_price = self._to_float(
            quote_data.get("last_price")
        )
        ohlc = quote_data.get("ohlc", {})
        open_price = self._to_float(ohlc.get("open"))
        high = self._to_float(ohlc.get("high"))
        low = self._to_float(ohlc.get("low"))
        previous_close = self._to_float(ohlc.get("close"))
        change = self._to_float(
            quote_data.get("net_change"),
            default=last_price - previous_close,
        )
        change_percent = (
            change / previous_close * 100
            if previous_close
            else 0
        )

        return IndexSnapshot(
            ltp=last_price,
            open=open_price,
            high=high,
            low=low,
            previous_close=previous_close,
            change=round(change, 2),
            change_percent=round(change_percent, 2),
        )

    def get_vix_snapshot(self) -> VixSnapshot:
        quote_data = self._get_quote(
            settings.UPSTOX_VIX_INSTRUMENT_KEY
        )
        value = self._to_float(
            quote_data.get("last_price")
        )
        ohlc = quote_data.get("ohlc", {})
        previous = self._to_float(ohlc.get("close"))
        change = self._to_float(
            quote_data.get("net_change"),
            default=value - previous,
        )
        change_percent = (
            change / previous * 100
            if previous
            else 0
        )

        return VixSnapshot(
            value=value,
            previous=previous,
            change=round(change, 2),
            change_percent=round(change_percent, 2),
        )

    def get_sector_snapshots(self) -> list[SectorSnapshot]:
        sector_instruments = settings.UPSTOX_SECTOR_INSTRUMENTS

        if not sector_instruments:
            return []

        quotes = self._get_quotes(
            list(sector_instruments.values())
        )

        snapshots = []

        for name, instrument_key in sector_instruments.items():
            quote_data = self._find_quote(
                quotes,
                instrument_key,
            )

            if quote_data is None:
                continue

            ltp = self._to_float(
                quote_data.get("last_price")
            )
            ohlc = quote_data.get("ohlc", {})
            previous_close = self._to_float(
                ohlc.get("close")
            )
            change = self._to_float(
                quote_data.get("net_change"),
                default=ltp - previous_close,
            )
            change_percent = (
                change / previous_close * 100
                if previous_close
                else 0.0
            )

            snapshots.append(
                SectorSnapshot(
                    name=name,
                    instrument_key=instrument_key,
                    ltp=ltp,
                    previous_close=previous_close,
                    change=round(change, 2),
                    change_percent=round(
                        change_percent,
                        2,
                    ),
                    direction=(
                        "UP"
                        if change >= 0
                        else "DOWN"
                    ),
                )
            )

        return snapshots

    def get_nifty_candles(self) -> list[MarketCandle]:
        instrument_key = quote(
            settings.UPSTOX_NIFTY_INSTRUMENT_KEY,
            safe="",
        )
        url = (
            f"{self.base_url}"
            "/v3/historical-candle/intraday"
            f"/{instrument_key}/minutes/5"
        )
        response = self.session.get(
            url,
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()

        if payload.get("status") != "success":
            raise RuntimeError(
                "Upstox intraday candle request failed."
            )

        raw_candles = (
            payload.get("data", {}).get("candles", [])
        )

        candles = []

        for item in raw_candles:
            if len(item) < 5:
                continue

            candles.append(
                MarketCandle(
                    timestamp=item[0],
                    open=self._to_float(item[1]),
                    high=self._to_float(item[2]),
                    low=self._to_float(item[3]),
                    close=self._to_float(item[4]),
                    volume=(
                        self._to_float(item[5])
                        if len(item) > 5
                        else 0
                    ),
                    open_interest=(
                        self._to_float(item[6])
                        if len(item) > 6
                        else 0
                    ),
                )
            )

        candles.sort(
            key=lambda candle: candle.timestamp
        )
        return self._calculate_vwap(candles)

    @staticmethod
    def _calculate_vwap(
        candles: list[MarketCandle],
    ) -> list[MarketCandle]:
        if not candles:
            return candles

        has_volume = any(
            candle.volume > 0
            for candle in candles
        )
        cumulative_price_volume = 0.0
        cumulative_volume = 0.0
        cumulative_typical_price = 0.0

        for index, candle in enumerate(candles):
            typical_price = (
                candle.high
                + candle.low
                + candle.close
            ) / 3

            if has_volume:
                cumulative_price_volume += (
                    typical_price * candle.volume
                )
                cumulative_volume += candle.volume

                candle.vwap = round(
                    (
                        cumulative_price_volume
                        / cumulative_volume
                    )
                    if cumulative_volume
                    else typical_price,
                    2,
                )
            else:
                cumulative_typical_price += typical_price
                candle.vwap = round(
                    cumulative_typical_price
                    / (index + 1),
                    2,
                )

        return candles


    def get_nifty_option_chain(self) -> list[dict]:
        """Return current-week NIFTY option-chain rows from Upstox REST API."""
        url = f"{self.base_url}/v2/option/chain"
        response = self.session.get(url, params={"instrument_key": settings.UPSTOX_NIFTY_INSTRUMENT_KEY, "expiry_date": "current_week"}, timeout=10)
        response.raise_for_status()
        payload = response.json()
        rows = []
        for item in payload.get("data", []):
            call = item.get("call_options") or {}; put = item.get("put_options") or {}
            cm = call.get("market_data") or {}; pm = put.get("market_data") or {}
            cg = call.get("option_greeks") or {}; pg = put.get("option_greeks") or {}
            rows.append({
                "strike": self._to_float(item.get("strike_price")),
                "call_oi": int(self._to_float(cm.get("oi"))), "call_prev_oi": int(self._to_float(cm.get("prev_oi"))),
                "call_oi_change": int(self._to_float(cm.get("oi"))-self._to_float(cm.get("prev_oi"))),
                "call_volume": int(self._to_float(cm.get("volume"))), "call_iv": self._to_float(cg.get("iv")),
                "put_oi": int(self._to_float(pm.get("oi"))), "put_prev_oi": int(self._to_float(pm.get("prev_oi"))),
                "put_oi_change": int(self._to_float(pm.get("oi"))-self._to_float(pm.get("prev_oi"))),
                "put_volume": int(self._to_float(pm.get("volume"))), "put_iv": self._to_float(pg.get("iv")),
            })
        return rows


    def get_nifty_futures_snapshot(self) -> dict | None:
        """Return nearest-expiry NIFTY future quote and OI."""
        key = settings.UPSTOX_NIFTY_FUTURES_INSTRUMENT_KEY or self._find_nearest_nifty_future_key()
        if not key:
            return None
        q = self._get_quote(key)
        price = self._to_float(q.get("last_price"))
        oi = int(self._to_float(q.get("oi")))
        day_high = self._to_float(q.get("oi_day_high"))
        day_low = self._to_float(q.get("oi_day_low"))
        # Track a genuine observed OI baseline locally. The first observation has
        # no change; subsequent refreshes compare against the last observed OI.
        state_path = Path(settings.FUTURES_OI_STATE_FILE)
        try:
            state = json.loads(state_path.read_text())
        except Exception:
            state = {}
        previous_oi = self._to_float(state.get(key, {}).get("oi")) or None
        oi_change_percent = (
            ((oi - previous_oi) / previous_oi) * 100
            if previous_oi and oi else None
        )
        try:
            state[key] = {"oi": oi, "price": price}
            state_path.write_text(json.dumps(state))
        except Exception:
            pass
        return {"instrument_key": key, "price": price, "oi": oi,
                "oi_day_high": day_high, "oi_day_low": day_low,
                "oi_change_percent": round(oi_change_percent, 4) if oi_change_percent is not None else None}

    def _find_nearest_nifty_future_key(self) -> str | None:
        url = f"{self.base_url}/v2/instruments/search"
        try:
            response = self.session.get(url, params={"query": "NIFTY", "segment": "FO", "instrument_type": "FUT", "page_size": 50}, timeout=10)
            response.raise_for_status()
            rows = response.json().get("data", [])
            rows = [x for x in rows if x.get("instrument_type") == "FUT" and str(x.get("underlying_symbol", "")).upper() == "NIFTY"]
            rows.sort(key=lambda x: str(x.get("expiry", "9999-12-31")))
            return rows[0].get("instrument_key") if rows else None
        except Exception:
            return None

    def get_breadth_snapshot(self) -> dict | None:
        """Calculate NIFTY 50 breadth from configured keys or auto-resolved NSE EQ keys."""
        keys = settings.UPSTOX_BREADTH_INSTRUMENT_KEYS or self._resolve_nifty50_keys()
        if not keys:
            return None
        quotes = self._get_quotes(keys)
        advances = declines = unchanged = 0
        for key in keys:
            q = self._find_quote(quotes, key)
            if not q:
                continue
            ch = self._to_float(q.get("net_change"))
            if ch > 0: advances += 1
            elif ch < 0: declines += 1
            else: unchanged += 1
        total = advances + declines + unchanged
        if not total:
            return None
        return {"advances": advances, "declines": declines, "unchanged": unchanged,
                "advance_decline_ratio": round(advances / declines, 2) if declines else float(advances),
                "new_52_week_high": 0, "new_52_week_low": 0, "stocks_above_200_dma": 0.0}

    def _resolve_nifty50_keys(self) -> list[str]:
        # Constituents are symbols; instrument keys are resolved from Upstox's
        # official NSE instrument master and cached in-process.
        if hasattr(self, "_breadth_keys_cache"):
            return self._breadth_keys_cache
        symbols = {
            "ADANIENT","ADANIPORTS","APOLLOHOSP","ASIANPAINT","AXISBANK",
            "BAJAJ-AUTO","BAJFINANCE","BAJAJFINSV","BEL","BHARTIARTL",
            "CIPLA","COALINDIA","DRREDDY","EICHERMOT","ETERNAL",
            "GRASIM","HCLTECH","HDFCBANK","HDFCLIFE","HEROMOTOCO",
            "HINDALCO","HINDUNILVR","ICICIBANK","INDUSINDBK","INFY",
            "ITC","JIOFIN","JSWSTEEL","KOTAKBANK","LT","M&M",
            "MARUTI","NESTLEIND","NTPC","ONGC","POWERGRID","RELIANCE",
            "SBILIFE","SBIN","SHRIRAMFIN","SUNPHARMA","TATACONSUM",
            "TATAMOTORS","TATASTEEL","TCS","TECHM","TITAN","TRENT",
            "ULTRACEMCO","WIPRO"
        }
        try:
            r = self.session.get("https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz", timeout=20)
            r.raise_for_status()
            rows = json.loads(gzip.decompress(r.content).decode("utf-8"))
            keys = []
            for x in rows:
                sym = str(x.get("trading_symbol") or x.get("tradingsymbol") or "").upper()
                if sym in symbols and str(x.get("instrument_type", "")).upper() in {"EQ", "EQUITY"}:
                    key = x.get("instrument_key")
                    if key: keys.append(key)
            self._breadth_keys_cache = list(dict.fromkeys(keys))
        except Exception:
            self._breadth_keys_cache = []
        return self._breadth_keys_cache

    def _get_quote(
        self,
        instrument_key: str,
    ) -> dict:
        quotes = self._get_quotes([instrument_key])
        quote_data = self._find_quote(
            quotes,
            instrument_key,
        )

        if quote_data is None:
            raise RuntimeError(
                "Upstox returned no market quote data "
                f"for {instrument_key}."
            )

        return quote_data

    def _get_quotes(
        self,
        instrument_keys: list[str],
    ) -> dict:
        if not instrument_keys:
            return {}

        url = (
            f"{self.base_url}"
            "/v2/market-quote/quotes"
        )

        response = self.session.get(
            url,
            params={
                "instrument_key": ",".join(
                    instrument_keys
                )
            },
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()

        if payload.get("status") != "success":
            raise RuntimeError(
                "Upstox market quote request failed."
            )

        data = payload.get("data", {})

        if not data:
            raise RuntimeError(
                "Upstox returned no market quote data."
            )

        return data

    @staticmethod
    def _find_quote(
        quotes: dict,
        instrument_key: str,
    ) -> dict | None:
        if instrument_key in quotes:
            return quotes[instrument_key]

        normalized_target = (
            instrument_key
            .replace("|", ":")
            .lower()
        )

        for response_key, quote_data in quotes.items():
            normalized_key = (
                str(response_key)
                .replace("|", ":")
                .lower()
            )

            if normalized_key == normalized_target:
                return quote_data

            if (
                isinstance(quote_data, dict)
                and quote_data.get(
                    "instrument_token"
                )
                == instrument_key
            ):
                return quote_data

        return None

    @staticmethod
    def _to_float(
        value,
        default=0.0,
    ) -> float:
        if value is None:
            return float(default)

        try:
            return float(value)
        except (TypeError, ValueError):
            return float(default)
