from datetime import datetime, timedelta

from .base import (
    IndexSnapshot,
    MarketCandle,
    MarketDataProvider,
    SectorSnapshot,
    VixSnapshot,
)


class MockMarketDataProvider(MarketDataProvider):

    def get_nifty_snapshot(self) -> IndexSnapshot:
        return IndexSnapshot(
            ltp=25152.35,
            open=25020.15,
            high=25182.40,
            low=24985.20,
            previous_close=25019.90,
            change=132.45,
            change_percent=0.53,
        )

    def get_vix_snapshot(self) -> VixSnapshot:
        return VixSnapshot(
            value=14.85,
            previous=14.17,
            change=0.68,
            change_percent=4.80,
        )

    def get_nifty_candles(self) -> list[MarketCandle]:
        start = datetime.fromisoformat("2026-07-20T09:15:00+05:30")

        prices = [
            (25020, 25035, 24995, 25010),
            (25010, 25018, 24970, 24982),
            (24982, 25015, 24972, 25008),
            (25008, 25042, 24998, 25035),
            (25035, 25075, 25025, 25065),
            (25065, 25078, 25038, 25045),
            (25045, 25082, 25040, 25075),
            (25075, 25095, 25058, 25088),
            (25088, 25102, 25062, 25070),
            (25070, 25110, 25065, 25102),
            (25102, 25122, 25090, 25115),
            (25115, 25128, 25098, 25105),
            (25105, 25135, 25100, 25128),
            (25128, 25142, 25115, 25135),
            (25135, 25140, 25118, 25125),
            (25125, 25152, 25120, 25145),
            (25145, 25160, 25132, 25152),
        ]

        candles = []
        cumulative_typical_price = 0.0

        for index, (open_price, high, low, close) in enumerate(prices):
            typical_price = (high + low + close) / 3
            cumulative_typical_price += typical_price
            fallback_vwap = cumulative_typical_price / (index + 1)
            timestamp = start + timedelta(minutes=index * 5)

            candles.append(
                MarketCandle(
                    timestamp=timestamp.isoformat(),
                    open=open_price,
                    high=high,
                    low=low,
                    close=close,
                    volume=0,
                    open_interest=0,
                    vwap=round(fallback_vwap, 2),
                )
            )

        return candles

    def get_sector_snapshots(self) -> list[SectorSnapshot]:
        # Mock-only fallback. Production/upstox mode does not use these values.
        rows = [
            ("NIFTY BANK", "NSE_INDEX|Nifty Bank", 52000.0, 51800.0),
            ("NIFTY IT", "NSE_INDEX|Nifty IT", 38000.0, 38100.0),
            ("NIFTY AUTO", "NSE_INDEX|Nifty Auto", 24000.0, 23850.0),
            ("NIFTY FMCG", "NSE_INDEX|Nifty FMCG", 56000.0, 55900.0),
            ("NIFTY PHARMA", "NSE_INDEX|Nifty Pharma", 22000.0, 21900.0),
        ]

        snapshots = []

        for name, instrument_key, ltp, previous_close in rows:
            change = ltp - previous_close
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
                    change_percent=round(change_percent, 2),
                    direction="UP" if change >= 0 else "DOWN",
                )
            )

        return snapshots
