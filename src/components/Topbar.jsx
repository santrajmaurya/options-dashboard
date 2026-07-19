import {
  Menu,
  Settings,
  Bell,
} from "lucide-react";

export default function Topbar() {
  return (
    <header className="topbar">
      <button className="icon-button hamburger">
        <Menu />
      </button>

      <div className="top-section mode-section">
        <span className="top-label">MODE</span>

        <select>
          <option>INTRADAY</option>
          <option>POSITIONAL</option>
          <option>EXPIRY DAY</option>
        </select>
      </div>

      <div className="top-section nifty-section">
        <span className="top-label">NIFTY</span>
        <strong className="nifty-price">
          25,152.35 <small>↑ +132.45 (0.53%)</small>
        </strong>
      </div>

      <div className="top-section">
        <span className="top-label">TIME</span>
        <strong>11:20:00 AM</strong>
        <small>23 May 2024</small>
      </div>

      <div className="top-section update-section">
        <span className="top-label">NEXT UPDATE</span>

        <div className="update-content">
          <div className="countdown-circle">
            <span>04:32</span>
          </div>

          <small>(Every 5 Min)</small>
        </div>
      </div>

      <div className="top-section market-status">
        <span className="top-label">MARKET STATUS</span>
        <strong>
          <i />
          MARKET OPEN
        </strong>
      </div>

      <div className="top-actions">
        <button className="round-button">
          <Settings size={20} />
        </button>

        <button className="round-button notification">
          <Bell size={20} />
          <span>3</span>
        </button>
      </div>
    </header>
  );
}