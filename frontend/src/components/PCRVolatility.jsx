import Card from "./Card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const vixData = [
  { value: 12.72 },
  { value: 12.84 },
  { value: 12.78 },
  { value: 12.95 },
  { value: 13.08 },
  { value: 12.98 },
  { value: 13.14 },
  { value: 13.02 },
  { value: 13.22 },
  { value: 13.11 },
  { value: 13.32 },
  { value: 13.25 },
  { value: 13.42 },
];

export default function PCRVolatility() {
  return (
    <Card
      title="PCR & VOLATILITY"
      className="pcr-card"
    >
      <div className="pcr-main">
        <PCRMetric
          title="PCR (TOTAL)"
          value="1.18"
          status="BULLISH"
          previous="1.32"
          change="-10.6%"
        />

        <PCRMetric
          title="PCR (ATM ± 5)"
          value="1.42"
          status="BULLISH"
          previous="1.55"
          change="-8.4%"
        />

        <div className="vix-metric">
          <span className="metric-title">
            INDIA VIX
          </span>

          <strong>13.42</strong>

          <b className="green">
            +0.45 (+3.47%)
          </b>

          <div className="vix-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={vixData}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#23d77c"
                  fill="#23d77c"
                  fillOpacity={0.08}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="volatility-regime">
        <div>
          <span>VOLATILITY REGIME</span>
          <strong className="yellow">
            ELEVATED
          </strong>
        </div>

        <div>
          <span>IV PERCENTILE</span>
          <strong>72%</strong>
        </div>

        <div>
          <span>VIX TREND</span>
          <strong className="red">
            RISING ↑
          </strong>
        </div>
      </div>

      <div className="volatility-insight">
        <span>OPTION SELLING ENVIRONMENT</span>

        <strong className="green">
          FAVORABLE
        </strong>

        <small>
          Elevated premiums, but use defined-risk
          strategies due to rising volatility.
        </small>
      </div>
    </Card>
  );
}

function PCRMetric({
  title,
  value,
  status,
  previous,
  change,
}) {
  return (
    <div className="pcr-metric">
      <span className="metric-title">
        {title}
      </span>

      <strong>{value}</strong>

      <b className="green">{status}</b>

      <div className="pcr-comparison">
        <div>
          <span>PREV</span>
          <strong>{previous}</strong>
        </div>

        <div>
          <span>CHANGE</span>
          <strong className="green">
            {change}
          </strong>
        </div>
      </div>
    </div>
  );
}