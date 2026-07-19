import Card from "./Card";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import {
  chartData,
  priceLevels,
} from "../data/mockData";

export default function PriceAndLevels() {
  return (
    <Card title="PRICE & KEY LEVELS" className="price-level-card">
      <div className="price-layout">
        <div className="levels-list">
          {priceLevels.map(([name, value, status]) => (
            <div className="level-row" key={name}>
              <span>{name}</span>
              <strong>{value}</strong>
              <small className="green">{status}</small>
            </div>
          ))}
        </div>

        <div className="chart-area">
          <div className="chart-label">
            5m CHART WITH VWAP
          </div>

          <ResponsiveContainer width="100%" height={205}>
            <ComposedChart data={chartData}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                interval={3}
              />

              <YAxis
                domain={["dataMin - 30", "dataMax + 30"]}
                orientation="right"
                tick={{ fontSize: 10 }}
              />

              <Tooltip />

              <ReferenceLine
                y={25020}
                strokeDasharray="5 5"
              />

              <ReferenceLine
                y={24940}
                strokeDasharray="5 5"
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#26d77d"
                dot={false}
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="vwap"
                stroke="#e7b82f"
                dot={false}
                strokeWidth={1.5}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}