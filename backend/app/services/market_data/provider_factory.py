from app.config import settings

from .base import MarketDataProvider
from .mock_provider import (
    MockMarketDataProvider,
)
from .upstox_provider import (
    UpstoxMarketDataProvider,
)


def get_market_data_provider(
) -> MarketDataProvider:

    provider = (
        settings
        .MARKET_DATA_PROVIDER
    )

    if provider == "mock":

        return (
            MockMarketDataProvider()
        )

    if provider == "upstox":

        return (
            UpstoxMarketDataProvider()
        )

    raise ValueError(
        "Unsupported "
        "MARKET_DATA_PROVIDER: "
        f"{provider}"
    )