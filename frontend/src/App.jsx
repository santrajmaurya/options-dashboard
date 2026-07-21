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
import { connectDashboardSocket } from "./services/dashboardSocket";
import { mergeDashboardUpdate } from "./services/mergeDashboardUpdate";

import "./App.css";

export default function App() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState("connecting");

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

      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
   * Initial dashboard load.
   *
   * The API request is started asynchronously inside the effect.
   * This avoids calling loadDashboard(), which updates state,
   * synchronously from the effect body.
   */
  useEffect(() => {
    let cancelled = false;

    const initializeDashboard = async () => {
      try {
        const data = await fetchDashboard();

        if (cancelled) {
          return;
        }

        setDashboardData(data);
        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Dashboard API error:", err);

        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const disconnect = connectDashboardSocket({
      onData: (update) => {
        setDashboardData((current) => mergeDashboardUpdate(current, update));
        setError(null);
      },
      onError: (err) => {
        console.error("Dashboard WebSocket error:", err);
      },
      onStatusChange: (status) => {
        setSocketStatus(status);
        console.log("Dashboard WebSocket:", status);
      },
    });

    return disconnect;
  }, []);

  console.log("Dashboard data:", dashboardData);

  /*
   * Auto refresh.
   *
   * State-changing loadDashboard() is called from the timer callback,
   * rather than directly from the effect body.
   */
  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = window.setInterval(
      () => {
        void loadDashboard(true);
      },
      5 * 60 * 1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [autoRefresh, loadDashboard]);

  const handleRetry = () => {
    void loadDashboard();
  };

  const handleRefresh = () => {
    void loadDashboard(true);
  };

  if (loading) {
    return <div className="app-loading">Loading market dashboard...</div>;
  }

  if (error && !dashboardData) {
    return (
      <div className="app-error">
        <h2>Unable to load market data</h2>

        <p>{error}</p>

        <button type="button" onClick={handleRetry}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar data={dashboardData} />

      <div className="main-shell">
        <Topbar
          data={dashboardData}
          autoRefresh={autoRefresh}
          refreshInterval={300}
          socketStatus={socketStatus}
        />

        {error && (
          <div className="dashboard-api-warning">
            Live data refresh failed. Showing last available data.
          </div>
        )}

        <main className="dashboard-grid">
          <MarketRegime data={dashboardData?.regime} />

          <MultiTimeframeTrend data={dashboardData?.trend} />

          <PriceAndLevels
            nifty={dashboardData?.nifty}
            levels={dashboardData?.levels}
            candles={dashboardData?.candles ?? []}
          />

          <FuturesOI data={dashboardData?.futures} />

          <OptionChain
            data={dashboardData?.option_chain}
            nifty={dashboardData?.nifty}
          />

          <SupportResistance
            data={dashboardData?.levels}
            nifty={dashboardData?.nifty}
            optionChain={dashboardData?.option_chain}
          />

          <PCRVolatility
            optionChain={dashboardData?.option_chain}
            vix={dashboardData?.vix}
          />

          <IVMetrics data={dashboardData?.volatility} />

          <MarketBreadth data={dashboardData?.breadth} />

          <SectorStrength data={dashboardData?.sectors} />

          <StrategyEnvironment data={dashboardData?.strategies} />

          <EntryStatus data={dashboardData?.entry} />

          <RiskEvents data={dashboardData?.risk} />
        </main>

        <footer className="status-bar">
          <div className="status-bar-info">
            <div className="status-item">
              <span className="status-dot" />
              <span>
                DATA SOURCE: <strong>FastAPI / Upstox</strong>
              </span>
            </div>

            <div className="status-item">
              <span>
                DATA QUALITY: <strong>GOOD</strong>
              </span>
              <span className="status-dot" />
            </div>

            <div className="status-item">
              <span>
                LAST DATA RECEIVED:{" "}
                <strong>
                  {(dashboardData?.market?.last_tick_at ??
                  dashboardData?.market?.timestamp)
                    ? new Date(
                        dashboardData.market.last_tick_at ??
                          dashboardData.market.timestamp
                      ).toLocaleTimeString()
                    : "--"}
                </strong>
              </span>
            </div>
          </div>

          <div className="status-bar-actions">
            <button
              type="button"
              className="footer-button footer-button-primary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "REFRESHING..." : "REFRESH NOW"}
            </button>

            <button type="button" className="footer-button">
              EXPORT SNAPSHOT
            </button>

            <label className="auto-refresh-control">
              <span>AUTO REFRESH</span>

              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
              />

              <span className="auto-refresh-switch" />
            </label>
          </div>
        </footer>
      </div>
    </div>
  );
}
