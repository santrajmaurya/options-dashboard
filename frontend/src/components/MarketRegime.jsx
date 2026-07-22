import Card from "./Card";

export default function MarketRegime({ data }) {
  // Keep existing UI usable until API data is available.
  const regime = data ?? {};

  const score = regime.score ?? 74;
  const direction = regime.direction ?? "BULLISH";
  const confidence = regime.confidence ?? "HIGH";

  const components = regime.components ?? [
    {
      parameter: "Trend Score",
      score: 72,
      status: "Bullish",
    },
    {
      parameter: "Positioning Score",
      score: 61,
      status: "Bullish",
    },
    {
      parameter: "Breadth Score",
      score: 55,
      status: "Bullish",
    },
    {
      parameter: "Volatility Score",
      score: 68,
      status: "Elevated",
    },
  ];

  const semanticClass = (value) => {
    const text = String(value ?? "").toLowerCase();
    if (text.includes("bear") || text.includes("negative") || text.includes("down")) return "bearish";
    if (text.includes("bull") || text.includes("positive") || text.includes("up") || text.includes("discount")) return "bullish";
    if (text.includes("neutral") || text.includes("normal") || text.includes("flat")) return "neutral";
    return "neutral";
  };

  const directionClass = semanticClass(direction);

  const finalRegime =
    regime.final_regime ??
    `${direction} + ${regime.volatility ?? "ELEVATED VOLATILITY"}`;

  return (
    <Card title="MARKET REGIME SUMMARY" className="market-regime">
      <div className="regime-content">
        {/* LEFT SIDE - GAUGE */}
        <div className="gauge-area">
          <div className="gauge">
            <div className="gauge-center">
              <strong>{score}</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="gauge-range">
            <span>-100</span>
            <span>+100</span>
          </div>

          <h3 className={directionClass}>{direction}</h3>

          <p>
            Confidence: <strong>{confidence}</strong>
          </p>
        </div>

        {/* RIGHT SIDE - SCORE TABLE */}
        <div className="score-table">
          <div className="score-header">
            <span />
            <span>SCORE</span>
            <span>STATUS</span>
          </div>

          {components.map((item) => {
            const warning =
              item.status?.toLowerCase().includes("elevated") ||
              item.parameter?.toLowerCase().includes("volatility");

            const displayScore =
              item.score > 0 && !warning ? `+${item.score}` : item.score;

            return (
              <Score
                key={item.parameter}
                name={item.parameter}
                score={displayScore}
                status={item.status}
                warning={warning}
                semanticClass={semanticClass}
              />
            );
          })}

          <div className="final-regime">
            <span>MARKET REGIME</span>

            <strong className={directionClass}>{finalRegime}</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Score({ name, score, status, warning = false, semanticClass }) {
  const statusClassName = warning ? "neutral" : semanticClass(status);
  const scoreNumber = Number(score);
  const scoreClassName = Number.isFinite(scoreNumber) ? (scoreNumber > 0 ? "bullish" : scoreNumber < 0 ? "bearish" : "neutral") : statusClassName;

  return (
    <div className="score-row">
      <span>{name}</span>

      <strong className={scoreClassName}>{score}</strong>

      <strong className={statusClassName}>{status}</strong>
    </div>
  );
}
