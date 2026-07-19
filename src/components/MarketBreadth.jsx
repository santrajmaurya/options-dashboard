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

const COLORS = [
  "#25d77d",
  "#ef5350",
  "#b7c0cb",
];

export default function MarketBreadth() {
  return (
    <Card
      title="MARKET BREADTH"
      className="breadth-card"
    >
      <div className="breadth-layout">
        <div className="breadth-chart-container">
          <ResponsiveContainer
            width="100%"
            height={145}
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={37}
                outerRadius={55}
                paddingAngle={2}
                stroke="none"
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

          <div className="breadth-center">
            <strong>2.63</strong>
            <span>A/D</span>
          </div>
        </div>

        <div className="breadth-numbers">
          <div>
            <span>ADVANCES</span>
            <strong className="green">
              42 (70%)
            </strong>
          </div>

          <div>
            <span>DECLINES</span>
            <strong className="red">
              16 (27%)
            </strong>
          </div>

          <div>
            <span>UNCHANGED</span>
            <strong>2 (3%)</strong>
          </div>
        </div>

        <div className="breadth-details">
          <p>
            <span>New 52W High</span>
            <strong>18</strong>
          </p>

          <p>
            <span>New 52W Low</span>
            <strong>2</strong>
          </p>

          <p>
            <span>A/D Ratio</span>
            <strong className="green">
              2.63
            </strong>
          </p>

          <p>
            <span>Stocks &gt; 200 DMA</span>
            <strong className="green">
              68%
            </strong>
          </p>
        </div>
      </div>

      <div className="breadth-status">
        <span>MARKET PARTICIPATION</span>

        <strong className="green">
          BROAD BASED BULLISH
        </strong>
      </div>
    </Card>
  );
}