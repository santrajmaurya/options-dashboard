import Card from "./Card";
import NiftyCandlestickChart from "./NiftyCandlestickChart";
import { priceLevels } from "../data/mockData";

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
          <div className="chart-label">5m CHART WITH VWAP</div>
          <NiftyCandlestickChart />
        </div>
      </div>
    </Card>
  );
}