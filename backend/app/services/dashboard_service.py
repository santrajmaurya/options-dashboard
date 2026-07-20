from datetime import datetime
from zoneinfo import ZoneInfo

from app.market.models import (
    DashboardResponse,
    MarketStatus,
    NiftyData,
    VixData,
    CandleData,
    MarketRegime,
    RegimeComponent,
    TrendData,
    TrendTimeframe,
    FuturesData,
    OptionChainSummary,
    OptionChainStrike,
    LevelDetail,
    LevelsData,
    VolatilityData,
    BreadthData,
    EntryData,
    RiskData,
    StrategyData,
)

from app.services.market_data import (
    get_market_data_provider,
)


class DashboardService:

    def get_dashboard(self) -> DashboardResponse:

        now = datetime.now(
            ZoneInfo("Asia/Kolkata")
        )

        # ==========================================
        # MARKET DATA PROVIDER
        # ==========================================

        provider = (
            get_market_data_provider()
        )

        nifty_snapshot = (
            provider.get_nifty_snapshot()
        )

        vix_snapshot = (
            provider.get_vix_snapshot()
        )

        market_candles = (
            provider.get_nifty_candles()
        )

        candles = [
            CandleData(
                timestamp=candle.timestamp,
                open=candle.open,
                high=candle.high,
                low=candle.low,
                close=candle.close,
                volume=candle.volume,
                open_interest=candle.open_interest,
                vwap=candle.vwap,
            )
            for candle in market_candles
        ]

        # ==========================================
        # SHARED MARKET VALUES
        # ==========================================

        nifty_ltp = (
            nifty_snapshot.ltp
        )

        current_vwap = (
            candles[-1].vwap
            if candles and candles[-1].vwap is not None
            else nifty_ltp
        )

        # ==========================================
        # OPTION CHAIN
        # ==========================================

        option_chain = (
            self._get_option_chain()
        )

        # ==========================================
        # DYNAMIC SUPPORT / RESISTANCE
        # ==========================================

        levels = (
            self._get_dynamic_levels(
                option_chain=option_chain,
                current_price=nifty_ltp,
                vwap=current_vwap,
            )
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

                ltp=nifty_snapshot.ltp,

                change=(
                    nifty_snapshot.change
                ),

                change_percent=(
                    nifty_snapshot
                    .change_percent
                ),

                open=(
                    nifty_snapshot.open
                ),

                high=(
                    nifty_snapshot.high
                ),

                low=(
                    nifty_snapshot.low
                ),

                previous_close=(
                    nifty_snapshot
                    .previous_close
                ),
            ),

            # ==============================
            # INDIA VIX
            # ==============================

            vix=VixData(

                value=(
                    vix_snapshot.value
                ),

                previous=(
                    vix_snapshot.previous
                ),

                change=(
                    vix_snapshot.change
                ),

                change_percent=(
                    vix_snapshot
                    .change_percent
                ),
            ),

            # ==============================
            # NIFTY 5-MINUTE CANDLES
            # ==============================

            candles=candles,

            # ==============================
            # MARKET REGIME
            # ==============================

            regime=MarketRegime(

                score=74,

                direction="BULLISH",

                volatility="ELEVATED",

                final_regime=(
                    "BULLISH + ELEVATED "
                    "VOLATILITY"
                ),

                components=[

                    RegimeComponent(
                        parameter=(
                            "Trend Score"
                        ),
                        score=82,
                        status=(
                            "Strong Bullish"
                        ),
                    ),

                    RegimeComponent(
                        parameter=(
                            "Futures Positioning"
                        ),
                        score=68,
                        status=(
                            "Long Buildup"
                        ),
                    ),

                    RegimeComponent(
                        parameter=(
                            "Options Positioning"
                        ),
                        score=72,
                        status=(
                            "Put Writing"
                        ),
                    ),

                    RegimeComponent(
                        parameter=(
                            "Market Breadth"
                        ),
                        score=76,
                        status=(
                            "Broad Bullish"
                        ),
                    ),

                    RegimeComponent(
                        parameter=(
                            "Volatility"
                        ),
                        score=48,
                        status="Elevated",
                    ),

                    RegimeComponent(
                        parameter=(
                            "Price Structure"
                        ),
                        score=80,
                        status=(
                            "Above VWAP"
                        ),
                    ),
                ],
            ),

            # ==============================
            # TREND
            # ==============================

            trend=TrendData(

                overall_score=82,

                overall_status=(
                    "STRONG BULLISH"
                ),

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
                        status=(
                            "Strong Bullish"
                        ),
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

            option_chain=option_chain,

            # ==============================
            # DYNAMIC LEVELS
            # ==============================

            levels=levels,

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

                current_price=nifty_ltp,

                invalidation=24900,

                reasons=[

                    (
                        "Price extended "
                        "from VWAP"
                    ),

                    (
                        "Wait for pullback "
                        "or retest of "
                        "25,050 - 25,100 zone"
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

                environment=(
                    "TRADE WITH CAUTION"
                ),

                reasons=[

                    (
                        "No major high-impact "
                        "events today"
                    ),

                    (
                        "Overnight global "
                        "sentiment is neutral"
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
                    (
                        "Aggressive "
                        "Short Straddle"
                    ),
                ],
            ),
        )

    # ==========================================
    # OPTION CHAIN BUILDER
    # ==========================================

    def _get_option_chain(
        self,
    ) -> OptionChainSummary:

        strikes = [

            OptionChainStrike(
                strike=24900,
                call_oi=850000,
                call_oi_change=95000,
                put_oi=3820000,
                put_oi_change=410000,
            ),

            OptionChainStrike(
                strike=24950,
                call_oi=920000,
                call_oi_change=110000,
                put_oi=3250000,
                put_oi_change=360000,
            ),

            OptionChainStrike(
                strike=25000,
                call_oi=1450000,
                call_oi_change=180000,
                put_oi=4620000,
                put_oi_change=520000,
            ),

            OptionChainStrike(
                strike=25050,
                call_oi=1680000,
                call_oi_change=210000,
                put_oi=3480000,
                put_oi_change=390000,
            ),

            OptionChainStrike(
                strike=25100,
                call_oi=2250000,
                call_oi_change=290000,
                put_oi=3150000,
                put_oi_change=350000,
            ),

            OptionChainStrike(
                strike=25150,
                call_oi=2780000,
                call_oi_change=360000,
                put_oi=2920000,
                put_oi_change=330000,
            ),

            OptionChainStrike(
                strike=25200,
                call_oi=3420000,
                call_oi_change=440000,
                put_oi=2350000,
                put_oi_change=270000,
            ),

            OptionChainStrike(
                strike=25250,
                call_oi=3580000,
                call_oi_change=470000,
                put_oi=1920000,
                put_oi_change=220000,
            ),

            OptionChainStrike(
                strike=25300,
                call_oi=3850000,
                call_oi_change=510000,
                put_oi=1550000,
                put_oi_change=175000,
            ),

            OptionChainStrike(
                strike=25350,
                call_oi=3180000,
                call_oi_change=390000,
                put_oi=1280000,
                put_oi_change=140000,
            ),

            OptionChainStrike(
                strike=25400,
                call_oi=2750000,
                call_oi_change=310000,
                put_oi=980000,
                put_oi_change=105000,
            ),
        ]

        max_call = max(
            strikes,
            key=lambda item: (
                item.call_oi
            ),
        )

        max_put = max(
            strikes,
            key=lambda item: (
                item.put_oi
            ),
        )

        total_call_oi = sum(
            item.call_oi
            for item in strikes
        )

        total_put_oi = sum(
            item.put_oi
            for item in strikes
        )

        pcr_oi = (
            total_put_oi
            / total_call_oi
            if total_call_oi
            else 0
        )

        return OptionChainSummary(

            atm_strike=25150,

            max_call_oi_strike=(
                max_call.strike
            ),

            max_put_oi_strike=(
                max_put.strike
            ),

            max_call_oi=(
                max_call.call_oi
            ),

            max_put_oi=(
                max_put.put_oi
            ),

            pcr_oi=round(
                pcr_oi,
                2,
            ),

            # Temporary until live
            # option-volume data exists.
            pcr_volume=1.12,

            strikes=strikes,
        )

    # ==========================================
    # DYNAMIC SUPPORT / RESISTANCE
    # ==========================================

    def _get_dynamic_levels(
        self,
        option_chain: OptionChainSummary,
        current_price: float,
        vwap: float,
    ) -> LevelsData:

        strikes = option_chain.strikes

        support_candidates = [
            strike
            for strike in strikes
            if strike.strike
            < current_price
        ]

        resistance_candidates = [
            strike
            for strike in strikes
            if strike.strike
            > current_price
        ]

        # ======================================
        # SUPPORT STRENGTH
        #
        # 70% Total Put OI
        # 30% Put OI Change
        # ======================================

        def support_strength(
            strike: OptionChainStrike,
        ) -> float:

            return (
                strike.put_oi * 0.70
                + strike.put_oi_change
                * 0.30
            )

        # ======================================
        # RESISTANCE STRENGTH
        #
        # 70% Total Call OI
        # 30% Call OI Change
        # ======================================

        def resistance_strength(
            strike: OptionChainStrike,
        ) -> float:

            return (
                strike.call_oi * 0.70
                + strike.call_oi_change
                * 0.30
            )

        # ======================================
        # NORMALIZATION BASE
        # ======================================

        max_support_strength = max(
            (
                support_strength(
                    strike
                )
                for strike
                in support_candidates
            ),
            default=1,
        )

        max_resistance_strength = max(
            (
                resistance_strength(
                    strike
                )
                for strike
                in resistance_candidates
            ),
            default=1,
        )

        # ======================================
        # BUILD SUPPORT
        # ======================================

        def build_support(
            strike: OptionChainStrike,
        ) -> LevelDetail:

            raw_score = (
                support_strength(
                    strike
                )
            )

            score = round(
                (
                    raw_score
                    / max_support_strength
                )
                * 100
            )

            distance = (
                strike.strike
                - current_price
            )

            distance_percent = (
                (
                    distance
                    / current_price
                )
                * 100
                if current_price
                else 0
            )

            return LevelDetail(

                strike=strike.strike,

                score=score,

                oi=strike.put_oi,

                oi_change=(
                    strike.put_oi_change
                ),

                distance=round(
                    distance,
                    2,
                ),

                distance_percent=round(
                    distance_percent,
                    2,
                ),
            )

        # ======================================
        # BUILD RESISTANCE
        # ======================================

        def build_resistance(
            strike: OptionChainStrike,
        ) -> LevelDetail:

            raw_score = (
                resistance_strength(
                    strike
                )
            )

            score = round(
                (
                    raw_score
                    / max_resistance_strength
                )
                * 100
            )

            distance = (
                strike.strike
                - current_price
            )

            distance_percent = (
                (
                    distance
                    / current_price
                )
                * 100
                if current_price
                else 0
            )

            return LevelDetail(

                strike=strike.strike,

                score=score,

                oi=strike.call_oi,

                oi_change=(
                    strike.call_oi_change
                ),

                distance=round(
                    distance,
                    2,
                ),

                distance_percent=round(
                    distance_percent,
                    2,
                ),
            )

        # ======================================
        # SORT BY STRENGTH
        # ======================================

        strongest_supports = sorted(
            support_candidates,
            key=support_strength,
            reverse=True,
        )

        strongest_resistances = sorted(
            resistance_candidates,
            key=resistance_strength,
            reverse=True,
        )

        # ======================================
        # FALLBACKS
        # ======================================

        if not strongest_supports:

            fallback_support = (
                strikes[0]
            )

            strongest_supports = [
                fallback_support,
                fallback_support,
            ]

        elif (
            len(strongest_supports)
            == 1
        ):

            strongest_supports.append(
                strongest_supports[0]
            )

        if not strongest_resistances:

            fallback_resistance = (
                strikes[-1]
            )

            strongest_resistances = [
                fallback_resistance,
                fallback_resistance,
            ]

        elif (
            len(
                strongest_resistances
            )
            == 1
        ):

            strongest_resistances.append(
                strongest_resistances[0]
            )

        # ======================================
        # FINAL LEVELS
        # ======================================

        return LevelsData(

            support_1=build_support(
                strongest_supports[0]
            ),

            support_2=build_support(
                strongest_supports[1]
            ),

            resistance_1=(
                build_resistance(
                    strongest_resistances[0]
                )
            ),

            resistance_2=(
                build_resistance(
                    strongest_resistances[1]
                )
            ),

            vwap=round(
                vwap,
                2,
            ),
        )


dashboard_service = DashboardService()