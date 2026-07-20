from pydantic import BaseModel, Field


# ==========================================
# MARKET STATUS
# ==========================================


class MarketStatus(BaseModel):
    status: str
    timestamp: str


# ==========================================
# NIFTY
# ==========================================


class NiftyData(BaseModel):
    ltp: float

    change: float
    change_percent: float

    open: float
    high: float
    low: float

    previous_close: float


# ==========================================
# INDIA VIX
# ==========================================


class VixData(BaseModel):
    value: float

    previous: float

    change: float
    change_percent: float


# ==========================================
# CANDLES
# ==========================================


class CandleData(BaseModel):
    timestamp: str

    open: float
    high: float
    low: float
    close: float

    volume: float = 0

    open_interest: float = 0

    vwap: float | None = None


# ==========================================
# MARKET REGIME
# ==========================================


class RegimeComponent(BaseModel):
    parameter: str

    score: float

    status: str


class MarketRegime(BaseModel):
    score: float

    direction: str

    volatility: str

    final_regime: str

    components: list[RegimeComponent]


# ==========================================
# TREND
# ==========================================


class TrendTimeframe(BaseModel):
    timeframe: str

    direction: str

    score: float

    status: str


class TrendData(BaseModel):
    overall_score: float

    overall_status: str

    timeframes: list[TrendTimeframe]


# ==========================================
# FUTURES
# ==========================================


class FuturesData(BaseModel):
    price: float

    basis: float

    oi: int

    oi_change_percent: float

    signal: str


# ==========================================
# OPTION CHAIN
# ==========================================


class OptionChainStrike(BaseModel):
    strike: float

    call_oi: int
    call_oi_change: int

    put_oi: int
    put_oi_change: int


class OptionChainSummary(BaseModel):
    atm_strike: float

    max_call_oi_strike: float
    max_put_oi_strike: float

    max_call_oi: int
    max_put_oi: int

    pcr_oi: float
    pcr_volume: float

    strikes: list[OptionChainStrike] = Field(
        default_factory=list,
    )


# ==========================================
# SUPPORT / RESISTANCE LEVELS
# ==========================================


class LevelDetail(BaseModel):
    strike: float

    score: int

    oi: int
    oi_change: int

    distance: float
    distance_percent: float


class LevelsData(BaseModel):
    support_1: LevelDetail
    support_2: LevelDetail

    resistance_1: LevelDetail
    resistance_2: LevelDetail

    vwap: float


# ==========================================
# VOLATILITY
# ==========================================


class VolatilityData(BaseModel):
    atm_iv: float

    iv_percentile: float

    iv_rank: float

    regime: str


# ==========================================
# MARKET BREADTH
# ==========================================


class BreadthData(BaseModel):
    advances: int

    declines: int

    unchanged: int

    advance_decline_ratio: float

    new_52_week_high: int
    new_52_week_low: int

    stocks_above_200_dma: float


# ==========================================
# ENTRY ENGINE
# ==========================================


class EntryData(BaseModel):
    status: str

    entry_low: float
    entry_high: float

    current_price: float

    invalidation: float

    reasons: list[str]


# ==========================================
# RISK ENGINE
# ==========================================


class RiskData(BaseModel):
    score: float

    level: str

    environment: str

    reasons: list[str]


# ==========================================
# STRATEGY ENGINE
# ==========================================


class StrategyData(BaseModel):
    preferred: list[str]

    neutral: list[str]

    avoid: list[str]


# ==========================================
# DASHBOARD RESPONSE
# ==========================================


class DashboardResponse(BaseModel):
    market: MarketStatus

    nifty: NiftyData

    vix: VixData

    candles: list[CandleData] = Field(
        default_factory=list,
    )

    regime: MarketRegime

    trend: TrendData

    futures: FuturesData

    option_chain: OptionChainSummary

    levels: LevelsData

    volatility: VolatilityData

    breadth: BreadthData

    entry: EntryData

    risk: RiskData

    strategies: StrategyData