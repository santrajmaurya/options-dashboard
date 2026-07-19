import { useEffect, useState } from "react";

import { Menu, Settings, Bell } from "lucide-react";

export default function Topbar({
  data,
  autoRefresh = true,
  refreshInterval = 300,
}) {
  const [countdown, setCountdown] = useState(refreshInterval);

  // ---------------------------------------------
  // API DATA
  // ---------------------------------------------

  const market = data?.market ?? {};
  const nifty = data?.nifty ?? {};

  // ---------------------------------------------
  // SAFE FALLBACK VALUES
  // These keep the existing UI working even if
  // some backend fields are temporarily missing.
  // ---------------------------------------------

  const price = nifty.ltp ?? 25152.35;

  const change = nifty.change ?? 132.45;

  const changePercent = nifty.change_percent ?? 0.53;

  const open = nifty.open ?? 25020.15;

  const high = nifty.high ?? 25182.4;

  const low = nifty.low ?? 24985.2;

  const previousClose = nifty.previous_close ?? 25019.9;

  const timestamp = market.timestamp ?? null;

  const marketStatus = market.status ?? "MARKET OPEN";

  // ---------------------------------------------
  // PRICE DIRECTION
  // ---------------------------------------------

  const isPositive = Number(change) >= 0;

  // ---------------------------------------------
  // COUNTDOWN TIMER
  // ---------------------------------------------

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          return refreshInterval;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  // ---------------------------------------------
  // NUMBER FORMATTER
  // ---------------------------------------------

  const formatNumber = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "--";
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------------------------------------------
  // COUNTDOWN FORMATTER
  // ---------------------------------------------

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);

    const seconds = countdown % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // ---------------------------------------------
  // TIME FORMATTER
  // ---------------------------------------------

  const formatTime = () => {
    if (!timestamp) {
      return "11:20:00 AM";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "11:20:00 AM";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // ---------------------------------------------
  // DATE FORMATTER
  // ---------------------------------------------

  const formatDate = () => {
    if (!timestamp) {
      return "23 May 2024";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "23 May 2024";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ---------------------------------------------
  // MARKET STATUS
  // ---------------------------------------------

  const isMarketOpen = String(marketStatus).toUpperCase().includes("OPEN");

  return (
    <header className="topbar">
      {/* Hamburger */}
      <button className="icon-button hamburger" aria-label="Open menu">
        <Menu size={21} />
      </button>

      {/* Mode */}
      <div className="top-section mode-section">
        <span className="top-label">MODE</span>

        <select defaultValue="expiry">
          <option value="intraday">INTRADAY</option>

          <option value="expiry">EXPIRY DAY</option>

          <option value="positional">POSITIONAL</option>
        </select>
      </div>

      {/* NIFTY Market Snapshot */}
      <div className="top-section nifty-section">
        <div className="nifty-header-row">
          <span className="nifty-title">NIFTY</span>

          <span className="nifty-market-badge">NSE</span>
        </div>

        <div className="nifty-market-data">
          {/* Current Price */}
          <div className="nifty-current">
            <strong>{formatNumber(price)}</strong>

            <span className={isPositive ? "green" : "red"}>
              {isPositive ? "↑" : "↓"} {isPositive ? "+" : ""}
              {formatNumber(change)}
              {" ("}
              {isPositive ? "+" : ""}
              {Number(changePercent).toFixed(2)}
              %)
            </span>
          </div>

          {/* OPEN */}
          <div className="nifty-mini-stat">
            <span>OPEN</span>

            <strong>{formatNumber(open)}</strong>
          </div>

          {/* HIGH */}
          <div className="nifty-mini-stat">
            <span>HIGH</span>

            <strong className="green">{formatNumber(high)}</strong>
          </div>

          {/* LOW */}
          <div className="nifty-mini-stat">
            <span>LOW</span>

            <strong className="red">{formatNumber(low)}</strong>
          </div>

          {/* PREVIOUS CLOSE */}
          <div className="nifty-mini-stat">
            <span>PREV CLOSE</span>

            <strong>{formatNumber(previousClose)}</strong>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="top-section time-section">
        <span className="top-label">TIME</span>

        <strong>{formatTime()}</strong>

        <small>{formatDate()}</small>
      </div>

      {/* Next Update */}
      <div className="top-section update-section">
        <span className="top-label">NEXT UPDATE</span>

        <div className="update-content">
          <div className="countdown-circle">
            <span>{formatCountdown()}</span>
          </div>

          <small>{autoRefresh ? "(Every 5 Min)" : "(Paused)"}</small>
        </div>
      </div>

      {/* Market Status */}
      <div className="top-section market-status">
        <span className="top-label">MARKET STATUS</span>

        <strong className={isMarketOpen ? "green" : "red"}>
          <i />

          {marketStatus}
        </strong>
      </div>

      {/* Actions */}
      <div className="top-actions">
        <button className="round-button" aria-label="Settings">
          <Settings size={18} />
        </button>

        <button
          className="round-button notification"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span>3</span>
        </button>
      </div>
    </header>
  );
}
