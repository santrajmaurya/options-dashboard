import requests

from app.config import settings

from .base import (
    IndexSnapshot,
    MarketDataProvider,
    VixSnapshot,
)


class UpstoxMarketDataProvider(
    MarketDataProvider
):

    def __init__(self):

        if not settings.UPSTOX_ACCESS_TOKEN:
            raise RuntimeError(
                "UPSTOX_ACCESS_TOKEN is not configured."
            )

        self.base_url = (
            settings.UPSTOX_API_BASE_URL
        )

        self.session = requests.Session()

        self.session.headers.update(
            {
                "Accept": "application/json",
                "Authorization": (
                    "Bearer "
                    f"{settings.UPSTOX_ACCESS_TOKEN}"
                ),
            }
        )

    def get_nifty_snapshot(
        self,
    ) -> IndexSnapshot:

        quote = self._get_quote(
            settings.UPSTOX_NIFTY_INSTRUMENT_KEY
        )

        last_price = self._to_float(
            quote.get("last_price")
        )

        ohlc = quote.get(
            "ohlc",
            {},
        )

        open_price = self._to_float(
            ohlc.get("open")
        )

        high = self._to_float(
            ohlc.get("high")
        )

        low = self._to_float(
            ohlc.get("low")
        )

        previous_close = self._to_float(
            ohlc.get("close")
        )

        change = self._to_float(
            quote.get("net_change"),
            default=(
                last_price
                - previous_close
            ),
        )

        change_percent = (
            (
                change
                / previous_close
            )
            * 100
            if previous_close
            else 0
        )

        return IndexSnapshot(
            ltp=last_price,

            open=open_price,
            high=high,
            low=low,

            previous_close=previous_close,

            change=round(
                change,
                2,
            ),

            change_percent=round(
                change_percent,
                2,
            ),
        )

    def get_vix_snapshot(
        self,
    ) -> VixSnapshot:

        quote = self._get_quote(
            settings.UPSTOX_VIX_INSTRUMENT_KEY
        )

        value = self._to_float(
            quote.get("last_price")
        )

        ohlc = quote.get(
            "ohlc",
            {},
        )

        previous = self._to_float(
            ohlc.get("close")
        )

        change = self._to_float(
            quote.get("net_change"),
            default=(
                value
                - previous
            ),
        )

        change_percent = (
            (
                change
                / previous
            )
            * 100
            if previous
            else 0
        )

        return VixSnapshot(
            value=value,

            previous=previous,

            change=round(
                change,
                2,
            ),

            change_percent=round(
                change_percent,
                2,
            ),
        )

    def _get_quote(
        self,
        instrument_key: str,
    ) -> dict:

        url = (
            f"{self.base_url}"
            "/v2/market-quote/quotes"
        )

        response = self.session.get(
            url,
            params={
                "instrument_key":
                    instrument_key,
            },
            timeout=10,
        )

        response.raise_for_status()

        payload = response.json()

        if (
            payload.get("status")
            != "success"
        ):
            raise RuntimeError(
                "Upstox market quote "
                "request failed."
            )

        data = payload.get(
            "data",
            {},
        )

        if not data:
            raise RuntimeError(
                "Upstox returned no "
                "market quote data."
            )

        return next(
            iter(
                data.values()
            )
        )

    @staticmethod
    def _to_float(
        value,
        default=0.0,
    ) -> float:

        if value is None:
            return float(default)

        try:
            return float(value)

        except (
            TypeError,
            ValueError,
        ):
            return float(default)