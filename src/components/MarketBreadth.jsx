import Card from "./Card";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Advances", value: 42 },
  { name: "Declines", value: 16 },
  { name: "Unchanged", value: 2 },
];

const COLORS = ["#25d77d", "#ef5350", "#b7c0cb"];

export default function MarketBreadth() {
  return (
    <Card title="MARKET BREADTH" className="breadth-card">
      <div className="breadth-layout">
        <div className="breadth-chart">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={32}
                outerRadius={48}
                paddingAngle={1}
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="breadth-numbers">
          <span className="green">
            ADVANCES <strong>42 (70%)</strong>
          </span>

          <span className="red">
            DECLINES <strong>16 (27%)</strong>
          </span>

          <span>
            UNCHANGED <strong>2 (3%)</strong>
          </span>
        </div>

        <div className="breadth-details">
          <p>New 52W High <strong>18</strong></p>
          <p>New 52W Low <strong>2</strong></p>
          <p>Advance/Decline Ratio <strong>2.63</strong></p>
          <p>Bullish Stocks &gt; 200 DMA <strong>68%</strong></p>
        </div>
      </div>
    </Card>
  );
}