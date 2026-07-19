from datetime import datetime
from zoneinfo import ZoneInfo

from app.market.models import (
    DashboardResponse,
    MarketStatus,
    NiftyData,
    VixData,
    MarketRegime,
    RegimeComponent,
    TrendData,
    TrendTimeframe,
    FuturesData,
    OptionChainSummary,
    LevelsData,
    VolatilityData,
    BreadthData,
    EntryData,
    RiskData,
    StrategyData,
)


class DashboardService:

    def get_dashboard(self) -> DashboardResponse:

        now = datetime.now(
            ZoneInfo("Asia/Kolkata")
        )

        return DashboardResponse(

            # ==============================
            # MARKET
            # ==============================

            market=MarketStatus(
                status="OPEN",
                timestamp=now.isoformat(),
            ),

            # ==============================
            # NIFTY
            # ==============================

            nifty=NiftyData(
                ltp=25152.35,
                change=132.45,
                change_percent=0.53,

                open=25020.15,
                high=25182.40,
                low=24985.20,
                previous_close=25019.90,
            ),

            # ==============================
            # INDIA VIX
            # ==============================

            vix=VixData(
                value=14.85,
                previous=14.17,
                change=0.68,
                change_percent=4.80,
            ),

            # ==============================
            # MARKET REGIME
            # ==============================

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

            # ==============================
            # TREND
            # ==============================

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

            # ==============================
            # FUTURES
            # ==============================

            futures=FuturesData(

                price=25178.50,

                basis=26.15,

                oi=12548000,

                oi_change_percent=6.8,

                signal="LONG BUILDUP",
            ),

            # ==============================
            # OPTION CHAIN
            # ==============================

            option_chain=OptionChainSummary(

                atm_strike=25150,

                max_call_oi_strike=25300,

                max_put_oi_strike=25000,

                max_call_oi=3850000,

                max_put_oi=4620000,

                pcr_oi=1.18,

                pcr_volume=1.12,
            ),

            # ==============================
            # LEVELS
            # ==============================

            levels=LevelsData(

                support_1=25100,
                support_2=25000,

                resistance_1=25200,
                resistance_2=25300,

                vwap=25084.50,
            ),

            # ==============================
            # VOLATILITY
            # ==============================

            volatility=VolatilityData(

                atm_iv=16.80,

                iv_percentile=62,

                iv_rank=54,

                regime="ELEVATED",
            ),

            # ==============================
            # MARKET BREADTH
            # ==============================

            breadth=BreadthData(

                advances=42,

                declines=16,

                unchanged=2,

                advance_decline_ratio=2.63,

                new_52_week_high=18,

                new_52_week_low=2,

                stocks_above_200_dma=68,
            ),

            # ==============================
            # ENTRY ENGINE
            # ==============================

            entry=EntryData(

                status="WAIT",

                entry_low=25050,

                entry_high=25100,

                current_price=25152.35,

                invalidation=24900,

                reasons=[

                    "Price extended from VWAP",

                    (
                        "Wait for pullback or retest "
                        "of 25,050 - 25,100 zone"
                    ),

                    (
                        "Watch for Put Writing "
                        "confirmation"
                    ),
                ],
            ),

            # ==============================
            # RISK ENGINE
            # ==============================

            risk=RiskData(

                score=48,

                level="MODERATE",

                environment="TRADE WITH CAUTION",

                reasons=[

                    (
                        "No major high-impact "
                        "events today"
                    ),

                    (
                        "Overnight global sentiment "
                        "is neutral"
                    ),

                    (
                        "India VIX is rising"
                    ),

                    (
                        "Prefer defined-risk "
                        "option strategies"
                    ),
                ],
            ),

            # ==============================
            # STRATEGY ENGINE
            # ==============================

            strategies=StrategyData(

                preferred=[

                    "Bull Put Spread",

                    "Put Credit Spread",
                ],

                neutral=[

                    "Iron Condor",
                ],

                avoid=[

                    "Naked Call Selling",

                    "Aggressive Short Straddle",
                ],
            ),
        )


dashboard_service = DashboardService()