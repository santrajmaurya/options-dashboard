import { useEffect, useState } from "react";
import { Menu, Settings, Bell } from "lucide-react";

export default function Topbar({
  data,
  autoRefresh = true,
  refreshInterval = 300,
  socketStatus = "connecting",
}) {
  const [countdown, setCountdown] = useState(refreshInterval);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // --------------------------------------------------
  // API DATA
  // --------------------------------------------------

  const market = data?.market ?? {};
  const nifty = data?.nifty ?? {};

  const price = nifty.ltp ?? 0;
  const change = nifty.change ?? 0;
  const changePercent = nifty.change_percent ?? 0;

  const open = nifty.open ?? 0;
  const high = nifty.high ?? 0;
  const low = nifty.low ?? 0;
  const previousClose = nifty.previous_close ?? 0;

  const timestamp = market.timestamp ?? null;
  const rawMarketStatus = market.market_status ?? market.status ?? "UNKNOWN";
  const feedState = String(
    market.feed_state ?? socketStatus ?? "CONNECTING"
  ).toUpperCase();

  // --------------------------------------------------
  // DERIVED VALUES
  // --------------------------------------------------

  const numericChange = Number(change);
  const numericChangePercent = Number(changePercent);

  const isPositive = numericChange >= 0;

  const normalizedMarketStatus = String(rawMarketStatus).toUpperCase();

  const isMarketOpen =
    normalizedMarketStatus === "OPEN" ||
    normalizedMarketStatus === "MARKET OPEN";

  const marketStatusLabel = isMarketOpen
    ? "MARKET OPEN"
    : normalizedMarketStatus === "CLOSED" ||
        normalizedMarketStatus === "MARKET CLOSED"
      ? "MARKET CLOSED"
      : normalizedMarketStatus;

  // --------------------------------------------------
  // COUNTDOWN TIMER
  // --------------------------------------------------

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

  // --------------------------------------------------
  // NUMBER FORMATTER
  // --------------------------------------------------

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "--";
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // --------------------------------------------------
  // COUNTDOWN FORMATTER
  // --------------------------------------------------

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // REFRESH INTERVAL LABEL
  // --------------------------------------------------

  const formatRefreshInterval = () => {
    if (refreshInterval % 60 === 0) {
      const minutes = refreshInterval / 60;

      return `(Every ${minutes} Min)`;
    }

    return `(Every ${refreshInterval} Sec)`;
  };

  // --------------------------------------------------
  // LIVE CLOCK
  // --------------------------------------------------

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <header className="topbar">
      {/* Hamburger */}
      <button
        type="button"
        className="icon-button hamburger"
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      {/* Mode */}
      <div className="top-section mode-section">
        <span className="top-label">MODE</span>

        <select defaultValue="expiry" aria-label="Trading mode">
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
              {formatNumber(numericChange)}
              {" ("}
              {isPositive ? "+" : ""}
              {Number.isFinite(numericChangePercent)
                ? numericChangePercent.toFixed(2)
                : "--"}
              %)
            </span>
          </div>

          {/* Open */}
          <div className="nifty-mini-stat">
            <span>OPEN</span>

            <strong>{formatNumber(open)}</strong>
          </div>

          {/* High */}
          <div className="nifty-mini-stat">
            <span>HIGH</span>

            <strong className="green">{formatNumber(high)}</strong>
          </div>

          {/* Low */}
          <div className="nifty-mini-stat">
            <span>LOW</span>

            <strong className="red">{formatNumber(low)}</strong>
          </div>

          {/* Previous Close */}
          <div className="nifty-mini-stat">
            <span>PREV CLOSE</span>

            <strong>{formatNumber(previousClose)}</strong>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="top-section time-section">
        <span className="top-label">TIME</span>

        <strong>{formattedTime}</strong>

        <small>{formattedDate}</small>
      </div>

      {/* Next Update */}
      <div className="top-section update-section">
        <span className="top-label">NEXT UPDATE</span>

        <div className="update-content">
          <div className="countdown-circle">
            <span>{formatCountdown()}</span>
          </div>

          <small>{autoRefresh ? formatRefreshInterval() : "(Paused)"}</small>
        </div>
      </div>

      {/* Market Status */}
      <div className="top-section market-status">
        <span className="top-label">MARKET STATUS</span>

        <strong className={isMarketOpen ? "green" : "red"}>
          <i />

          {marketStatusLabel}
          <small style={{ display: "block", marginTop: 4 }}>
            FEED: {feedState}
            {market.simulated ? " (SIM)" : ""}
          </small>
        </strong>
      </div>

      {/* Actions */}
      <div className="top-actions">
        <button type="button" className="round-button" aria-label="Settings">
          <Settings size={18} />
        </button>

        <button
          type="button"
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
