from typing import List
from pydantic import BaseModel


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


class RegimeComponent(BaseModel):
    parameter: str
    score: int
    status: str


class MarketRegime(BaseModel):
    score: int
    direction: str
    volatility: str
    final_regime: str

    components: List[RegimeComponent]


class TrendTimeframe(BaseModel):
    timeframe: str
    direction: str
    score: int
    status: str


class TrendData(BaseModel):
    overall_score: int
    overall_status: str

    timeframes: List[TrendTimeframe]


class FuturesData(BaseModel):
    price: float
    basis: float
    oi: int
    oi_change_percent: float
    signal: str


class OptionChainSummary(BaseModel):
    atm_strike: int

    max_call_oi_strike: int
    max_put_oi_strike: int

    max_call_oi: int
    max_put_oi: int

    pcr_oi: float
    pcr_volume: float


class LevelsData(BaseModel):
    support_1: float
    support_2: float

    resistance_1: float
    resistance_2: float

    vwap: float


class VolatilityData(BaseModel):
    atm_iv: float
    iv_percentile: float
    iv_rank: float

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

    reasons: List[str]


class RiskData(BaseModel):
    score: int
    level: str

    environment: str

    reasons: List[str]


class StrategyData(BaseModel):
    preferred: List[str]
    neutral: List[str]
    avoid: List[str]


class DashboardResponse(BaseModel):
    market: MarketStatus

    nifty: NiftyData
    vix: VixData

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