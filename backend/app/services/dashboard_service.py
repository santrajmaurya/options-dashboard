from dataclasses import asdict
from datetime import datetime
from zoneinfo import ZoneInfo

from app.services.market_data import (
    get_market_data_provider,
)
from app.market.models import (
    BreadthData,
    DashboardResponse,
    EntryData,
    FuturesData,
    LevelDetail,
    LevelsData,
    MarketRegime,
    MarketStatus,
    NiftyData,
    OptionChainSummary,
    RegimeComponent,
    RiskData,
    SectorData,
    StrategyData,
    TrendData,
    TrendTimeframe,
    VixData,
    VolatilityData,
)


class DashboardService:

    def get_dashboard(self) -> DashboardResponse:
        provider = get_market_data_provider()

        nifty = provider.get_nifty_snapshot()
        vix = provider.get_vix_snapshot()
        candles = provider.get_nifty_candles()
        sector_snapshots = (
            provider.get_sector_snapshots()
        )

        now = datetime.now(
            ZoneInfo("Asia/Kolkata")
        )

        sectors = [
            SectorData(**asdict(sector))
            for sector in sector_snapshots
        ]

        # NOTE:
        # Sector data above is now provider-driven and therefore
        # real when MARKET_DATA_PROVIDER=upstox.
        #
        # The remaining analytics below are retained from the
        # current dashboard contract. They should be migrated
        # individually to real/derived provider data next.

        support_1 = self._level(
            25100,
            nifty.ltp,
            82,
        )
        support_2 = self._level(
            25000,
            nifty.ltp,
            74,
        )
        resistance_1 = self._level(
            25200,
            nifty.ltp,
            88,
        )
        resistance_2 = self._level(
            25300,
            nifty.ltp,
            79,
        )

        latest_vwap = (
            candles[-1].vwap
            if candles and candles[-1].vwap is not None
            else nifty.ltp
        )

        return DashboardResponse(
            market=MarketStatus(
                status="OPEN",
                timestamp=now.isoformat(),
            ),
            nifty=NiftyData(
                ltp=nifty.ltp,
                change=nifty.change,
                change_percent=nifty.change_percent,
                open=nifty.open,
                high=nifty.high,
                low=nifty.low,
                previous_close=nifty.previous_close,
            ),
            vix=VixData(
                value=vix.value,
                previous=vix.previous,
                change=vix.change,
                change_percent=vix.change_percent,
            ),
            candles=[
                asdict(candle)
                for candle in candles
            ],
            regime=MarketRegime(
                score=74,
                direction="BULLISH",
                volatility="ELEVATED",
                final_regime=(
                    "BULLISH + ELEVATED VOLATILITY"
                ),
                components=[
                    RegimeComponent(
                        parameter="Trend Score",
                        score=82,
                        status="Strong Bullish",
                    ),
                    RegimeComponent(
                        parameter="Futures Positioning",
                        score=68,
                        status="Long Buildup",
                    ),
                    RegimeComponent(
                        parameter="Options Positioning",
                        score=72,
                        status="Put Writing",
                    ),
                    RegimeComponent(
                        parameter="Market Breadth",
                        score=76,
                        status="Broad Bullish",
                    ),
                    RegimeComponent(
                        parameter="Volatility",
                        score=48,
                        status="Elevated",
                    ),
                    RegimeComponent(
                        parameter="Price Structure",
                        score=80,
                        status="Above VWAP",
                    ),
                ],
            ),
            trend=TrendData(
                overall_score=82,
                overall_status="STRONG BULLISH",
                timeframes=[
                    TrendTimeframe(
                        timeframe="5 Min",
                        direction="UP",
                        score=78,
                        status="Bullish",
                    ),
                    TrendTimeframe(
                        timeframe="15 Min",
                        direction="UP",
                        score=82,
                        status="Bullish",
                    ),
                    TrendTimeframe(
                        timeframe="1 Hour",
                        direction="UP",
                        score=85,
                        status="Strong Bullish",
                    ),
                    TrendTimeframe(
                        timeframe="Daily",
                        direction="UP",
                        score=80,
                        status="Bullish",
                    ),
                ],
            ),
            futures=FuturesData(
                price=nifty.ltp,
                basis=0,
                oi=0,
                oi_change_percent=0,
                signal="UNAVAILABLE",
            ),
            option_chain=OptionChainSummary(
                atm_strike=round(
                    nifty.ltp / 50
                ) * 50,
                max_call_oi_strike=0,
                max_put_oi_strike=0,
                max_call_oi=0,
                max_put_oi=0,
                pcr_oi=0,
                pcr_volume=0,
                strikes=[],
            ),
            levels=LevelsData(
                support_1=support_1,
                support_2=support_2,
                resistance_1=resistance_1,
                resistance_2=resistance_2,
                vwap=latest_vwap,
            ),
            volatility=VolatilityData(
                atm_iv=0,
                iv_percentile=0,
                iv_rank=0,
                regime="UNAVAILABLE",
            ),
            breadth=BreadthData(
                advances=0,
                declines=0,
                unchanged=0,
                advance_decline_ratio=0,
                new_52_week_high=0,
                new_52_week_low=0,
                stocks_above_200_dma=0,
            ),
            sectors=sectors,
            entry=EntryData(
                status="WAIT",
                entry_low=support_1.strike,
                entry_high=nifty.ltp,
                current_price=nifty.ltp,
                invalidation=support_2.strike,
                reasons=[
                    "Entry engine awaiting real "
                    "option-chain integration."
                ],
            ),
            risk=RiskData(
                score=0,
                level="UNAVAILABLE",
                environment="DATA INCOMPLETE",
                reasons=[
                    "Risk engine requires additional "
                    "live market and event data."
                ],
            ),
            strategies=StrategyData(
                preferred=[],
                neutral=[],
                avoid=[],
            ),
        )

    @staticmethod
    def _level(
        strike: float,
        current_price: float,
        score: int,
    ) -> LevelDetail:
        distance = strike - current_price
        distance_percent = (
            distance / current_price * 100
            if current_price
            else 0
        )

        return LevelDetail(
            strike=strike,
            score=score,
            oi=0,
            oi_change=0,
            distance=round(distance, 2),
            distance_percent=round(
                distance_percent,
                2,
            ),
        )


dashboard_service = DashboardService()
