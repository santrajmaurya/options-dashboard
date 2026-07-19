import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MarketRegime from "./components/MarketRegime";
import MultiTimeframeTrend from "./components/MultiTimeframeTrend";
import PriceAndLevels from "./components/PriceAndLevels";
import FuturesOI from "./components/FuturesOI";
import OptionChain from "./components/OptionChain";
import SupportResistance from "./components/SupportResistance";
import PCRVolatility from "./components/PCRVolatility";
import IVMetrics from "./components/IVMetrics";
import MarketBreadth from "./components/MarketBreadth";
import SectorStrength from "./components/SectorStrength";
import StrategyEnvironment from "./components/StrategyEnvironment";
import EntryStatus from "./components/EntryStatus";
import RiskEvents from "./components/RiskEvents";

import "./App.css";

export default function App() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-shell">
        <Topbar />

        <main className="dashboard-grid">
          <MarketRegime />
          <MultiTimeframeTrend />
          <PriceAndLevels />

          <FuturesOI />
          <OptionChain />
          <SupportResistance />

          <PCRVolatility />
          <IVMetrics />
          <MarketBreadth />
          <SectorStrength />

          <StrategyEnvironment />
          <EntryStatus />
          <RiskEvents />
        </main>

        <footer className="status-footer">
          <div className="footer-info">
            <span>
              <i className="online-dot" />
              DATA SOURCE: <strong>Upstox API</strong>
            </span>

            <span>
              DATA QUALITY: <strong>GOOD</strong>
              <i className="online-dot" />
            </span>

            <span>
              LAST DATA RECEIVED: <strong>11:19:58 AM</strong>
            </span>
          </div>

          <div className="footer-actions">
            <button className="primary-button">
              REFRESH NOW
            </button>

            <button className="secondary-button">
              EXPORT SNAPSHOT
            </button>

            <label className="toggle-label">
              AUTO REFRESH

              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() =>
                  setAutoRefresh(!autoRefresh)
                }
              />

              <span className="toggle" />
            </label>
          </div>
        </footer>
      </div>
    </div>
  );
}