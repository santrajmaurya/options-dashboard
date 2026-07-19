import Card from "./Card";

export default function MarketRegime() {
  return (
    <Card title="MARKET REGIME SUMMARY" className="market-regime">
      <div className="regime-content">
        <div className="gauge-area">
          <div className="gauge">
            <div className="gauge-center">
              <strong>74</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="gauge-range">
            <span>-100</span>
            <span>+100</span>
          </div>

          <h3>BULLISH</h3>
          <p>
            Confidence: <strong>HIGH</strong>
          </p>
        </div>

        <div className="score-table">
          <div className="score-header">
            <span />
            <span>SCORE</span>
            <span>STATUS</span>
          </div>

          <Score name="Trend Score" score="+72" status="Bullish" />
          <Score name="Positioning Score" score="+61" status="Bullish" />
          <Score name="Breadth Score" score="+55" status="Bullish" />
          <Score
            name="Volatility Score"
            score="68"
            status="Elevated"
            warning
          />

          <div className="final-regime">
            <span>MARKET REGIME</span>
            <strong>BULLISH + ELEVATED VOLATILITY</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Score({ name, score, status, warning }) {
  return (
    <div className="score-row">
      <span>{name}</span>
      <strong className={warning ? "yellow" : "green"}>
        {score}
      </strong>
      <strong className={warning ? "yellow" : "green"}>
        {status}
      </strong>
    </div>
  );
}