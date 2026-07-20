from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class IndexSnapshot:
    ltp: float

    open: float
    high: float
    low: float

    previous_close: float

    change: float
    change_percent: float


@dataclass
class VixSnapshot:
    value: float

    previous: float

    change: float
    change_percent: float


@dataclass
class MarketCandle:
    timestamp: str

    open: float
    high: float
    low: float
    close: float

    volume: float = 0

    open_interest: float = 0

    vwap: float | None = None


class MarketDataProvider(ABC):

    @abstractmethod
    def get_nifty_snapshot(
        self,
    ) -> IndexSnapshot:
        raise NotImplementedError

    @abstractmethod
    def get_vix_snapshot(
        self,
    ) -> VixSnapshot:
        raise NotImplementedError

    @abstractmethod
    def get_nifty_candles(
        self,
    ) -> list[MarketCandle]:
        raise NotImplementedError