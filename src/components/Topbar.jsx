import {
  Menu,
  Settings,
  Bell,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      {/* Hamburger */}
      <button
        className="icon-button hamburger"
        aria-label="Open menu"
      >
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
          <span className="nifty-title">
            NIFTY
          </span>

          <span className="nifty-market-badge">
            NSE
          </span>
        </div>

        <div className="nifty-market-data">
          <div className="nifty-current">
            <strong>25,152.35</strong>

            <span className="green">
              ↑ +132.45 (+0.53%)
            </span>
          </div>

          <div className="nifty-mini-stat">
            <span>OPEN</span>
            <strong>25,020.15</strong>
          </div>

          <div className="nifty-mini-stat">
            <span>HIGH</span>
            <strong className="green">
              25,182.40
            </strong>
          </div>

          <div className="nifty-mini-stat">
            <span>LOW</span>
            <strong className="red">
              24,985.20
            </strong>
          </div>

          <div className="nifty-mini-stat">
            <span>PREV CLOSE</span>
            <strong>25,019.90</strong>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="top-section time-section">
        <span className="top-label">TIME</span>

        <strong>11:20:00 AM</strong>

        <small>23 May 2024</small>
      </div>

      {/* Next Update */}
      <div className="top-section update-section">
        <span className="top-label">
          NEXT UPDATE
        </span>

        <div className="update-content">
          <div className="countdown-circle">
            <span>04:32</span>
          </div>

          <small>(Every 5 Min)</small>
        </div>
      </div>

      {/* Market Status */}
      <div className="top-section market-status">
        <span className="top-label">
          MARKET STATUS
        </span>

        <strong>
          <i />
          MARKET OPEN
        </strong>
      </div>

      {/* Actions */}
      <div className="top-actions">
        <button
          className="round-button"
          aria-label="Settings"
        >
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