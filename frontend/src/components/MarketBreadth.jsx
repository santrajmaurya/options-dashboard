import Card from "./Card";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#25d77d", "#ef5350", "#b7c0cb"];

export default function MarketBreadth({ data }) {
  const breadth = data ?? {};

  const advances = toNumber(breadth.advances);

  const declines = toNumber(breadth.declines);

  const unchanged = toNumber(breadth.unchanged);

  const adRatio = toNumber(breadth.advance_decline_ratio);

  const newHigh = toNumber(breadth.new_52_week_high);

  const newLow = toNumber(breadth.new_52_week_low);

  const stocksAbove200DMA = toNumber(breadth.stocks_above_200_dma);

  const total = advances + declines + unchanged;

  const advancePercent = calculatePercent(advances, total);

  const declinePercent = calculatePercent(declines, total);

  const unchangedPercent = calculatePercent(unchanged, total);

  const chartData = [
    {
      name: "Advances",
      value: advances,
    },
    {
      name: "Declines",
      value: declines,
    },
    {
      name: "Unchanged",
      value: unchanged,
    },
  ];

  const participation = getParticipationStatus(adRatio);

  return (
    <Card title="MARKET BREADTH" className="breadth-card">
      <div className="breadth-layout">
        {/* Donut Chart */}

        <div className="breadth-chart-container">
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={31}
                outerRadius={46}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((item, index) => (
                  <Cell key={item.name} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="breadth-center">
            <strong>{formatNumber(adRatio)}</strong>

            <span>A/D</span>
          </div>
        </div>

        {/* Advance / Decline */}

        <div className="breadth-numbers">
          <div>
            <span>ADVANCES</span>

            <strong className="green">
              {advances} ({advancePercent}%)
            </strong>
          </div>

          <div>
            <span>DECLINES</span>

            <strong className="red">
              {declines} ({declinePercent}%)
            </strong>
          </div>

          <div>
            <span>UNCHANGED</span>

            <strong>
              {unchanged} ({unchangedPercent}%)
            </strong>
          </div>
        </div>

        {/* Breadth Details */}

        <div className="breadth-details">
          <p>
            <span>New 52W High</span>

            <strong>{newHigh}</strong>
          </p>

          <p>
            <span>New 52W Low</span>

            <strong>{newLow}</strong>
          </p>

          <p>
            <span>A/D Ratio</span>

            <strong className={participation.className}>
              {formatNumber(adRatio)}
            </strong>
          </p>

          <p>
            <span>Stocks &gt; 200 DMA</span>

            <strong className={getDMAClass(stocksAbove200DMA)}>
              {formatPercent(stocksAbove200DMA)}
            </strong>
          </p>
        </div>
      </div>

      {/* Bottom Status */}

      <div className="breadth-status">
        <span>MARKET PARTICIPATION</span>

        <strong className={participation.className}>
          {participation.label}
        </strong>
      </div>
    </Card>
  );
}

function getParticipationStatus(ratio) {
  if (!Number.isFinite(ratio)) {
    return {
      label: "UNKNOWN",
      className: "unavailable",
    };
  }

  if (ratio >= 2) {
    return {
      label: "BROAD BASED BULLISH",
      className: "green",
    };
  }

  if (ratio >= 1.2) {
    return {
      label: "BULLISH",
      className: "green",
    };
  }

  if (ratio >= 0.8) {
    return {
      label: "NEUTRAL",
      className: "yellow",
    };
  }

  return {
    label: "BEARISH",
    className: "red",
  };
}

function getDMAClass(value) {
  if (value >= 60) {
    return "green";
  }

  if (value >= 40) {
    return "yellow";
  }

  return "red";
}

function calculatePercent(value, total) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toFixed(2);
}

function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${number.toFixed(0)}%`;
}
