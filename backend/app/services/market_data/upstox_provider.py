from urllib.parse import quote

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
