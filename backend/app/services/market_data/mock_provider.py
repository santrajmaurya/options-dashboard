from datetime import datetime, timedelta

from .base import (
    IndexSnapshot,
    MarketCandle,
    MarketDataProvider,
    VixSnapshot,
)


class MockMarketDataProvider(
    MarketDataProvider
):

    def get_nifty_snapshot(
        self,
    ) -> IndexSnapshot:

        return IndexSnapshot(
            ltp=25152.35,

            open=25020.15,
            high=25182.40,
            low=24985.20,

            previous_close=25019.90,

            change=132.45,
            change_percent=0.53,
        )

    def get_vix_snapshot(
        self,
    ) -> VixSnapshot:

        return VixSnapshot(
            value=14.85,

            previous=14.17,

            change=0.68,
            change_percent=4.80,
        )

    def get_nifty_candles(
        self,
    ) -> list[MarketCandle]:

        start = datetime.fromisoformat(
            "2026-07-20T09:15:00+05:30"
        )

        prices = [
            (
                25020,
                25035,
                24995,
                25010,
            ),
            (
                25010,
                25018,
                24970,
                24982,
            ),
            (
                24982,
                25015,
                24972,
                25008,
            ),
            (
                25008,
                25042,
                24998,
                25035,
            ),
            (
                25035,
                25075,
                25025,
                25065,
            ),
            (
                25065,
                25078,
                25038,
                25045,
            ),
            (
                25045,
                25082,
                25040,
                25075,
            ),
            (
                25075,
                25095,
                25058,
                25088,
            ),
            (
                25088,
                25102,
                25062,
                25070,
            ),
            (
                25070,
                25110,
                25065,
                25102,
            ),
            (
                25102,
                25122,
                25090,
                25115,
            ),
            (
                25115,
                25128,
                25098,
                25105,
            ),
            (
                25105,
                25135,
                25100,
                25128,
            ),
            (
                25128,
                25142,
                25115,
                25135,
            ),
            (
                25135,
                25140,
                25118,
                25125,
            ),
            (
                25125,
                25152,
                25120,
                25145,
            ),
            (
                25145,
                25160,
                25132,
                25152,
            ),
        ]

        candles = []

        cumulative_typical_price = 0

        for index, price in enumerate(
            prices
        ):
            (
                open_price,
                high,
                low,
                close,
            ) = price

            typical_price = (
                high
                + low
                + close
            ) / 3

            cumulative_typical_price += (
                typical_price
            )

            fallback_vwap = (
                cumulative_typical_price
                / (index + 1)
            )

            timestamp = (
                start
                + timedelta(
                    minutes=index * 5
                )
            )

            candles.append(
                MarketCandle(
                    timestamp=(
                        timestamp.isoformat()
                    ),
                    open=open_price,
                    high=high,
                    low=low,
                    close=close,
                    volume=0,
                    open_interest=0,
                    vwap=round(
                        fallback_vwap,
                        2,
                    ),
                )
            )

        return candles