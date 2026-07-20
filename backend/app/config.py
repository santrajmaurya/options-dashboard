import os

from dotenv import load_dotenv


load_dotenv()


class Settings:

    # ==========================================
    # APPLICATION
    # ==========================================

    APP_NAME = os.getenv(
        "APP_NAME",
        "Nifty Option Selling Dashboard API",
    )

    APP_ENV = os.getenv(
        "APP_ENV",
        "development",
    )

    DEBUG = (
        os.getenv(
            "DEBUG",
            "true",
        ).lower()
        == "true"
    )

    HOST = os.getenv(
        "HOST",
        "0.0.0.0",
    )

    PORT = int(
        os.getenv(
            "PORT",
            "8000",
        )
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    # ==========================================
    # MARKET DATA PROVIDER
    # ==========================================

    MARKET_DATA_PROVIDER = os.getenv(
        "MARKET_DATA_PROVIDER",
        "mock",
    ).lower()

    # ==========================================
    # UPSTOX
    # ==========================================

    UPSTOX_ACCESS_TOKEN = os.getenv(
        "UPSTOX_ACCESS_TOKEN",
        "",
    )

    UPSTOX_API_KEY = os.getenv(
        "UPSTOX_API_KEY",
        "",
    )

    UPSTOX_API_SECRET = os.getenv(
        "UPSTOX_API_SECRET",
        "",
    )

    UPSTOX_REDIRECT_URI = os.getenv(
        "UPSTOX_REDIRECT_URI",
        (
            "http://localhost:8000/"
            "api/auth/upstox/callback"
        ),
    )

    UPSTOX_API_BASE_URL = os.getenv(
        "UPSTOX_API_BASE_URL",
        "https://api.upstox.com",
    )

    # ==========================================
    # INSTRUMENT KEYS
    # ==========================================

    UPSTOX_NIFTY_INSTRUMENT_KEY = os.getenv(
        "UPSTOX_NIFTY_INSTRUMENT_KEY",
        "NSE_INDEX|Nifty 50",
    )

    UPSTOX_VIX_INSTRUMENT_KEY = os.getenv(
        "UPSTOX_VIX_INSTRUMENT_KEY",
        "NSE_INDEX|India VIX",
    )


settings = Settings()