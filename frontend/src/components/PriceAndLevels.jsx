import Card from "./Card";
import NiftyCandlestickChart from "./NiftyCandlestickChart";

export default function PriceAndLevels({ nifty, levels, candles = [] }) {
  const market = nifty ?? {};
  const levelData = levels ?? {};

  const currentPrice = Number(market.ltp ?? 0);
  const vwap = Number(levelData.vwap ?? 0);

  const support1 = levelData.support_1;
  const support2 = levelData.support_2;

  const resistance1 = levelData.resistance_1;
  const resistance2 = levelData.resistance_2;

  const priceLevels = [
    {
      name: "CURRENT PRICE",
      value: currentPrice,
      status: currentPrice >= vwap ? "ABOVE VWAP" : "BELOW VWAP",
      className: currentPrice >= vwap ? "green" : "red",
    },

    {
      name: "VWAP",
      value: vwap,
      status: currentPrice >= vwap ? "SUPPORT" : "RESISTANCE",
      className: currentPrice >= vwap ? "green" : "red",
    },

    {
      name: "RESISTANCE 1",
      value: resistance1?.strike,
      status: resistance1 ? `${resistance1.score}/100` : "--",
      className: "red",
    },

    {
      name: "RESISTANCE 2",
      value: resistance2?.strike,
      status: resistance2 ? `${resistance2.score}/100` : "--",
      className: "red",
    },

    {
      name: "SUPPORT 1",
      value: support1?.strike,
      status: support1 ? `${support1.score}/100` : "--",
      className: "green",
    },

    {
      name: "SUPPORT 2",
      value: support2?.strike,
      status: support2 ? `${support2.score}/100` : "--",
      className: "green",
    },
  ];

  return (
    <Card title="PRICE & KEY LEVELS" className="price-level-card">
      <div className="price-layout">
        <div className="levels-list">
          {priceLevels.map((item) => (
            <div className="level-row" key={item.name}>
              <span>{item.name}</span>

              <strong>{formatPrice(item.value)}</strong>

              <small className={item.className}>{item.status}</small>
            </div>
          ))}
        </div>

        <div className="chart-area">
          <div className="chart-label">5m CHART WITH VWAP</div>

          <NiftyCandlestickChart candles={candles} />
        </div>
      </div>
    </Card>
  );
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
