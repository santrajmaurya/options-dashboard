import Card from "./Card";

export default function PCRVolatility() {
  return (
    <Card title="PCR & VOLATILITY" className="pcr-card">
      <div className="three-stats">
        <PCR
          title="PCR (TOTAL)"
          value="1.18"
          status="BULLISH"
          previous="1.32"
          change="-10.6%"
        />

        <PCR
          title="PCR (ATM ± 5)"
          value="1.42"
          status="BULLISH"
          previous="1.55"
          change="-8.4%"
        />

        <PCR
          title="INDIA VIX"
          value="13.42"
          status="+0.45 (3.47%)"
          vix
        />
      </div>
    </Card>
  );
}

function PCR({
  title,
  value,
  status,
  previous,
  change,
  vix,
}) {
  return (
    <div className="pcr-stat">
      <span>{title}</span>
      <strong>{value}</strong>
      <b className={vix ? "green" : "green"}>
        {status}
      </b>

      {!vix && (
        <div className="previous-data">
          <span>
            Prev
            <strong>{previous}</strong>
          </span>

          <span>
            Change
            <strong className="green">{change}</strong>
          </span>
        </div>
      )}

      {vix && (
        <div className="mini-sparkline">
          ︿﹏︿⌁︿﹏︿
        </div>
      )}
    </div>
  );
}