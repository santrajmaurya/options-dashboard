from pydantic import BaseModel, Field


class MarketStatus(BaseModel):
    status: str
    timestamp: str


class NiftyData(BaseModel):
    ltp: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    previous_close: float


class VixData(BaseModel):
    value: float
    previous: float
    change: float
    change_percent: float


class CandleData(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float = 0
    open_interest: float = 0
    vwap: float | None = None


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


class TrendTimeframe(BaseModel):
    timeframe: str
    direction: str
    score: float
    status: str


class TrendData(BaseModel):
    overall_score: float
    overall_status: str
    timeframes: list[TrendTimeframe]


class FuturesData(BaseModel):
    price: float | None
    basis: float | None
    oi: int | None
    oi_change_percent: float | None
    signal: str


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
    pcr_oi: float | None
    pcr_volume: float | None
    strikes: list[OptionChainStrike] = Field(
        default_factory=list
    )


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


class VolatilityData(BaseModel):
    atm_iv: float | None
    iv_percentile: float | None
    iv_rank: float | None
    regime: str


class BreadthData(BaseModel):
    advances: int
    declines: int
    unchanged: int
    advance_decline_ratio: float
    new_52_week_high: int
    new_52_week_low: int
    stocks_above_200_dma: float


class EntryData(BaseModel):
    status: str
    entry_low: float
    entry_high: float
    current_price: float
    invalidation: float
    reasons: list[str]


class RiskData(BaseModel):
    score: float
    level: str
    environment: str
    reasons: list[str]


class StrategyData(BaseModel):
    preferred: list[str]
    neutral: list[str]
    avoid: list[str]


class SectorData(BaseModel):
    name: str
    instrument_key: str
    ltp: float
    previous_close: float
    change: float
    change_percent: float
    direction: str


class DashboardResponse(BaseModel):
    market: MarketStatus
    nifty: NiftyData
    vix: VixData
    candles: list[CandleData] = Field(
        default_factory=list
    )
    regime: MarketRegime
    trend: TrendData
    futures: FuturesData
    option_chain: OptionChainSummary
    levels: LevelsData
    volatility: VolatilityData
    breadth: BreadthData
    sectors: list[SectorData] = Field(
        default_factory=list
    )
    entry: EntryData
    risk: RiskData
    strategies: StrategyData
