import { useCallback, useEffect, useState } from "react";

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

import { fetchDashboard } from "./services/dashboardApi";

import "./App.css";

export default function App() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      setError(null);

      const data = await fetchDashboard();

      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard API error:", err);

      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboard]);

  if (loading) {
    return (
      <div className="app-loading">
        Loading market dashboard...
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="app-error">
        <h2>Unable to load market data</h2>

        <p>{error}</p>

        <button onClick={() => loadDashboard()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-shell">
        <Topbar
  data={dashboardData}
  autoRefresh={autoRefresh}
  refreshInterval={300}
/>

        {error && (
          <div className="dashboard-api-warning">
            Live data refresh failed. Showing last available data.
          </div>
        )}

        <main className="dashboard-grid">
          <MarketRegime
            data={dashboardData?.regime}
          />

          <MultiTimeframeTrend
            data={dashboardData?.trend}
          />

          <PriceAndLevels
            nifty={dashboardData?.nifty}
            levels={dashboardData?.levels}
          />

          <FuturesOI
            data={dashboardData?.futures}
          />

          <OptionChain
            data={dashboardData?.option_chain}
          />

          <SupportResistance
            data={dashboardData?.levels}
            nifty={dashboardData?.nifty}
          />

          <PCRVolatility
            optionChain={dashboardData?.option_chain}
            vix={dashboardData?.vix}
          />

          <IVMetrics
            data={dashboardData?.volatility}
          />

          <MarketBreadth
            data={dashboardData?.breadth}
          />

          <SectorStrength />

          <StrategyEnvironment
            data={dashboardData?.strategies}
          />

          <EntryStatus
            data={dashboardData?.entry}
          />

          <RiskEvents
            data={dashboardData?.risk}
          />
        </main>

        <footer className="status-bar">
          <div>
            DATA SOURCE: FastAPI / Upstox
          </div>

          <div>
            DATA QUALITY: GOOD
          </div>

          <div>
            LAST DATA RECEIVED:{" "}
            {dashboardData?.market?.timestamp
              ? new Date(
                  dashboardData.market.timestamp
                ).toLocaleTimeString()
              : "--"}
          </div>

          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing
              ? "REFRESHING..."
              : "REFRESH NOW"}
          </button>

          <button>
            EXPORT SNAPSHOT
          </button>

          <label>
            AUTO REFRESH

            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) =>
                setAutoRefresh(event.target.checked)
              }
            />
          </label>
        </footer>
      </div>
    </div>
  );
}