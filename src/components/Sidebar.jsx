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
  function MiniTrend({ index }) {
  const patterns = [
    [25, 38, 32, 55, 48, 70, 65, 82],
    [22, 30, 28, 45, 42, 60, 58, 75],
    [20, 27, 40, 35, 52, 48, 65, 72],
    [20, 45, 32, 55, 40, 70, 48, 60],
    [25, 35, 30, 50, 45, 58, 62, 78],
  ];

  const values = patterns[index % patterns.length];

  return (
    <div className="watch-mini-chart">
      {values.map((height, i) => (
        <i
          key={i}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
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

       {watchlist.map((item, index) => (
  <div className="watch-row" key={item.name}>
    <div className="watch-left">
      <div className="watch-symbol">
        <span className="market-dot" />
        <strong>{item.name}</strong>
      </div>

      <MiniTrend index={index} />
    </div>

    <div className="watch-price">
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