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