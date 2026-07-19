import Card from "./Card";

export default function MarketRegime({ data }) {
  // Keep existing UI usable until API data is available
  console.log("MarketRegime data:", data);
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

  const finalRegime =
    regime.final_regime ??
    `${direction} + ${regime.volatility ?? "ELEVATED VOLATILITY"}`;

  return (
    <Card
      title="MARKET REGIME SUMMARY"
      className="market-regime"
    >
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

          <h3>{direction}</h3>

          <p>
            Confidence:{" "}
            <strong>{confidence}</strong>
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
              item.status
                ?.toLowerCase()
                .includes("elevated") ||
              item.parameter
                ?.toLowerCase()
                .includes("volatility");

            return (
              <Score
                key={item.parameter}
                name={item.parameter}
                score={
                  item.score > 0 &&
                  !warning
                    ? `+${item.score}`
                    : item.score
                }
                status={item.status}
                warning={warning}
              />
            );
          })}

          <div className="final-regime">
            <span>MARKET REGIME</span>

            <strong>
              {finalRegime}
            </strong>
          </div>

        </div>

      </div>
    </Card>
  );
}


function Score({
  name,
  score,
  status,
  warning,
}) {
  return (
    <div className="score-row">

      <span>
        {name}
      </span>

      <strong
        className={
          warning
            ? "yellow"
            : "green"
        }
      >
        {score}
      </strong>

      <strong
        className={
          warning
            ? "yellow"
            : "green"
        }
      >
        {status}
      </strong>

    </div>
  );
}