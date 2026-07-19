from typing import Any


class MarketStore:

    def __init__(self):
        self._data: dict[str, Any] = {}

    def set(self, key: str, value: Any):
        self._data[key] = value

    def get(self, key: str, default=None):
        return self._data.get(key, default)

    def get_all(self):
        return self._data.copy()

    def clear(self):
        self._data.clear()


market_store = MarketStore()