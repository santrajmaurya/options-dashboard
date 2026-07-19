import Card from "./Card";
import { trendData } from "../data/mockData";

export default function MultiTimeframeTrend() {
  return (
    <Card title="TREND (MULTI-TIMEFRAME)" className="trend-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>TIMEFRAME</th>
            <th>TREND</th>
            <th>DIRECTION</th>
            <th>STRENGTH</th>
          </tr>
        </thead>

        <tbody>
          {trendData.map((row) => (
            <tr key={row.timeframe}>
              <td>{row.timeframe}</td>
              <td className={row.type === "bull" ? "green" : "red"}>
                {row.trend}
              </td>
              <td
                className={`direction ${
                  row.type === "bull" ? "green" : "red"
                }`}
              >
                {row.direction}
              </td>
              <td>{row.strength}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="trend-footer">
        <div>
          <span>PRIMARY TREND</span>
          <strong className="green">BULLISH</strong>
        </div>

        <div>
          <span>CONDITION</span>
          <strong className="yellow">SHORT TERM PULLBACK</strong>
        </div>
      </div>
    </Card>
  );
}