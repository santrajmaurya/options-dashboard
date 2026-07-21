import os

from dotenv import load_dotenv


load_dotenv()


class Settings:

    APP_NAME = os.getenv(
        "APP_NAME",
        "Nifty Option Selling Dashboard API",
    )
    APP_ENV = os.getenv("APP_ENV", "development")
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    MARKET_DATA_PROVIDER = os.getenv(
        "MARKET_DATA_PROVIDER",
        "mock",
    ).lower()

    UPSTOX_ACCESS_TOKEN = os.getenv("UPSTOX_ACCESS_TOKEN", "")
    UPSTOX_API_KEY = os.getenv("UPSTOX_API_KEY", "")
    UPSTOX_API_SECRET = os.getenv("UPSTOX_API_SECRET", "")
    UPSTOX_REDIRECT_URI = os.getenv(
        "UPSTOX_REDIRECT_URI",
        "http://localhost:8000/api/auth/upstox/callback",
    )
    UPSTOX_API_BASE_URL = os.getenv(
        "UPSTOX_API_BASE_URL",
        "https://api.upstox.com",
    )

    UPSTOX_STREAM_RECONNECT_SECONDS = float(
        os.getenv(
            "UPSTOX_STREAM_RECONNECT_SECONDS",
            "2",
        )
    )

    UPSTOX_STREAM_RECONNECT_MAX_SECONDS = float(
        os.getenv("UPSTOX_STREAM_RECONNECT_MAX_SECONDS", "30")
    )


    UPSTOX_STREAM_SIMULATION = os.getenv(
        "UPSTOX_STREAM_SIMULATION", "false"
    ).lower() == "true"
    UPSTOX_STREAM_SIMULATION_INTERVAL_SECONDS = float(
        os.getenv("UPSTOX_STREAM_SIMULATION_INTERVAL_SECONDS", "2")
    )
    UPSTOX_STREAM_STALE_SECONDS = int(
        os.getenv("UPSTOX_STREAM_STALE_SECONDS", "30")
    )

    UPSTOX_NIFTY_INSTRUMENT_KEY = os.getenv(
        "UPSTOX_NIFTY_INSTRUMENT_KEY",
        "NSE_INDEX|Nifty 50",
    )
    UPSTOX_VIX_INSTRUMENT_KEY = os.getenv(
        "UPSTOX_VIX_INSTRUMENT_KEY",
        "NSE_INDEX|India VIX",
    )
    UPSTOX_NIFTY_FUTURES_INSTRUMENT_KEY = os.getenv("UPSTOX_NIFTY_FUTURES_INSTRUMENT_KEY", "")
    UPSTOX_BREADTH_INSTRUMENT_KEYS = [x.strip() for x in os.getenv("UPSTOX_BREADTH_INSTRUMENT_KEYS", "").split(",") if x.strip()]
    IV_HISTORY_FILE = os.getenv("IV_HISTORY_FILE", "iv_history.json")
    FUTURES_OI_STATE_FILE = os.getenv("FUTURES_OI_STATE_FILE", "futures_oi_state.json")
    UPSTOX_NIFTY_BANK_INSTRUMENT_KEY = os.getenv("UPSTOX_NIFTY_BANK_INSTRUMENT_KEY", "NSE_INDEX|Nifty Bank")
    UPSTOX_FINNIFTY_INSTRUMENT_KEY = os.getenv("UPSTOX_FINNIFTY_INSTRUMENT_KEY", "NSE_INDEX|Nifty Fin Service")

    UPSTOX_SECTOR_INSTRUMENTS = {
        "NIFTY BANK": os.getenv(
            "UPSTOX_NIFTY_BANK_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty Bank",
        ),
        "NIFTY IT": os.getenv(
            "UPSTOX_NIFTY_IT_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty IT",
        ),
        "NIFTY AUTO": os.getenv(
            "UPSTOX_NIFTY_AUTO_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty Auto",
        ),
        "NIFTY FMCG": os.getenv(
            "UPSTOX_NIFTY_FMCG_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty FMCG",
        ),
        "NIFTY PHARMA": os.getenv(
            "UPSTOX_NIFTY_PHARMA_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty Pharma",
        ),
        "NIFTY METAL": os.getenv(
            "UPSTOX_NIFTY_METAL_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty Metal",
        ),
        "NIFTY REALTY": os.getenv(
            "UPSTOX_NIFTY_REALTY_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty Realty",
        ),
        "NIFTY ENERGY": os.getenv(
            "UPSTOX_NIFTY_ENERGY_INSTRUMENT_KEY",
            "NSE_INDEX|Nifty Energy",
        ),
    }


settings = Settings()
