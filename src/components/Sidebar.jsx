import {
  LayoutDashboard,
  Gauge,
  CandlestickChart,
  BarChart3,
  ChartNoAxesCombined,
  Activity,
  LineChart,
  Bell,
  ChartSpline,
  FileText,
  Settings,
  TrendingUp,
  Pencil,
} from "lucide-react";

import { watchlist } from "../data/mockData";

const menu = [
  [LayoutDashboard, "DASHBOARD"],
  [Gauge, "MARKET REGIME"],
  [CandlestickChart, "PRICE ACTION"],
  [BarChart3, "FUTURES & OI"],
  [ChartNoAxesCombined, "OPTION CHAIN"],
  [Activity, "PCR & VOLATILITY"],
  [LineChart, "BREADTH & SECTORS"],
  [Bell, "ALERTS"],
  [ChartSpline, "BACKTEST"],
  [FileText, "REPORTS"],
  [Settings, "SETTINGS"],
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <TrendingUp />
        <div>
          <strong>NIFTY DASHBOARD</strong>
          <span>Market Regime &</span>
          <span>Option Selling System</span>
        </div>
      </div>

      <nav className="nav">
        {menu.map(([Icon, label], index) => (
          <button
            key={label}
            className={index === 0 ? "nav-item active" : "nav-item"}
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="watchlist">
        <div className="watchlist-heading">
          <strong>WATCHLIST</strong>
          <Pencil size={14} />
        </div>

        {watchlist.map((item) => (
          <div className="watch-row" key={item.name}>
            <span>{item.name}</span>

            <div>
              <strong>{item.value}</strong>
              <small>
                {item.points} ({item.change})
              </small>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}