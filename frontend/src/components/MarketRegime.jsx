import Card from "./Card";

export default function MarketRegime({ data }) {
  // Keep existing UI usable until API data is available.
  const regime = data ?? {};

  const score = Math.max(0, Math.min(100, Number(regime.score ?? 74)));
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
  const scoreBandClass = getScoreBandClass(score);
  const scorePosition = `${score}%`;

  const finalRegime =
    regime.final_regime ??
    `${direction} + ${regime.volatility ?? "ELEVATED VOLATILITY"}`;

  return (
    <Card title="MARKET REGIME SUMMARY" className="market-regime">
      <div className="regime-content">
        {/* LEFT SIDE - COMPACT SCORE (score strength is independent of regime label) */}
        <div className="gauge-area regime-score-area">
          <span className="regime-score-label">REGIME SCORE</span>
          <div className="regime-score-value">
            <strong className={scoreBandClass}>{score}</strong>
            <span>/100</span>
          </div>

          <div className="regime-score-track" aria-label={`Regime score ${score} out of 100`}>
            <span className="regime-zone zone-strong-red" />
            <span className="regime-zone zone-mild-red" />
            <span className="regime-zone zone-neutral" />
            <span className="regime-zone zone-mild-green" />
            <span className="regime-zone zone-strong-green" />
            <i className="regime-score-marker" style={{ left: scorePosition }} />
          </div>
          <div className="regime-score-scale">
            <span>0</span><span>50</span><span>100</span>
          </div>

          <h3 className={directionClass}>{direction}</h3>
          <p>Confidence: <strong>{confidence}</strong></p>
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
  const statusText = String(status ?? "");
  const isUnavailable = /unavailable|no data|unknown|n\/a/i.test(statusText);
  const statusClassName = isUnavailable
    ? "unavailable"
    : warning
      ? "neutral"
      : semanticClass(status);

  const scoreNumber = Number(String(score).replace("+", ""));
  const scoreClassName = !Number.isFinite(scoreNumber)
    ? "unavailable"
    : scoreNumber > 0
      ? "positive-score"
      : scoreNumber < 0
        ? "negative-score"
        : "neutral";

  return (
    <div className="score-row">
      <span>{name}</span>
      <strong className={scoreClassName}>{score}</strong>
      <strong className={statusClassName}>{status}</strong>
    </div>
  );
}

function getScoreBandClass(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return "unavailable";
  if (score <= 19) return "score-strong-red";
  if (score <= 49) return "score-mild-red";
  if (score === 50) return "score-neutral";
  if (score <= 69) return "score-mild-green";
  return "score-strong-green";
}
