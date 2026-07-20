from .base import (
    IndexSnapshot,
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