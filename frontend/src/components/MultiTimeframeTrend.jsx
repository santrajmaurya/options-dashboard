import Card from "./Card";

export default function MultiTimeframeTrend({ data }) {
  const trend = data ?? {};
  console.log("MultiTimeframeTrend data:", trend);

  const overallScore = Number(trend.overall_score ?? 0);

  const overallStatus = trend.overall_status ?? "NO DATA";

  const timeframes = trend.timeframes ?? [];

  const primaryTrend = getPrimaryTrend(overallStatus);

  const primaryTrendClass = getTrendClass(overallStatus);

  const condition = getMarketCondition(overallStatus, timeframes);

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
          {timeframes.length > 0 ? (
            timeframes.map((row) => {
              const trendClass = getTrendClass(row.status);

              const directionClass = getDirectionClass(row.direction);

              return (
                <tr key={row.timeframe}>
                  <td>{row.timeframe}</td>

                  <td className={trendClass}>{row.status}</td>

                  <td className={`direction ${directionClass}`}>
                    {getDirectionSymbol(row.direction)}
                  </td>

                  <td>{formatStrength(row.score)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="table-empty">
                Trend data unavailable
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="trend-footer">
        <div>
          <span>PRIMARY TREND</span>

          <strong className={primaryTrendClass}>{primaryTrend}</strong>
        </div>

        <div>
          <span>TREND SCORE</span>

          <strong className={primaryTrendClass}>{overallScore} / 100</strong>
        </div>

        <div>
          <span>CONDITION</span>

          <strong className={condition.className}>{condition.label}</strong>
        </div>
      </div>
    </Card>
  );
}

function getTrendClass(status = "") {
  const normalized = String(status).toUpperCase();

  if (normalized.includes("UNAVAILABLE") || normalized.includes("NO DATA") || normalized.includes("UNKNOWN")) {
    return "unavailable";
  }

  if (normalized.includes("BULLISH")) {
    return "green";
  }

  if (normalized.includes("BEARISH")) {
    return "red";
  }

  return "yellow";
}

function getDirectionClass(direction = "") {
  const normalized = String(direction).toUpperCase();

  if (normalized === "UP") {
    return "green";
  }

  if (normalized === "DOWN") {
    return "red";
  }

  return "yellow";
}

function getDirectionSymbol(direction = "") {
  const normalized = String(direction).toUpperCase();

  if (normalized === "UP") {
    return "↑ UP";
  }

  if (normalized === "DOWN") {
    return "↓ DOWN";
  }

  return "→ FLAT";
}

function formatStrength(score) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return "--";
  }

  return `${numericScore} / 100`;
}

function getPrimaryTrend(overallStatus = "") {
  const normalized = String(overallStatus).toUpperCase();

  if (normalized.includes("BULLISH")) {
    return "BULLISH";
  }

  if (normalized.includes("BEARISH")) {
    return "BEARISH";
  }

  return "NEUTRAL";
}

function getMarketCondition(overallStatus, timeframes) {
  if (!timeframes.length) {
    return {
      label: "NO DATA",
      className: "unavailable",
    };
  }

  const directions = timeframes.map((item) =>
    String(item.direction).toUpperCase()
  );

  const upCount = directions.filter((direction) => direction === "UP").length;

  const downCount = directions.filter(
    (direction) => direction === "DOWN"
  ).length;

  const total = directions.length;

  if (upCount === total) {
    return {
      label: "ALL TIMEFRAMES ALIGNED",
      className: "green",
    };
  }

  if (downCount === total) {
    return {
      label: "ALL TIMEFRAMES ALIGNED",
      className: "red",
    };
  }

  const normalizedOverall = String(overallStatus).toUpperCase();

  if (normalizedOverall.includes("BULLISH") && upCount > downCount) {
    return {
      label: "SHORT TERM PULLBACK",
      className: "yellow",
    };
  }

  if (normalizedOverall.includes("BEARISH") && downCount > upCount) {
    return {
      label: "SHORT TERM RECOVERY",
      className: "yellow",
    };
  }

  return {
    label: "MIXED TIMEFRAMES",
    className: "yellow",
  };
}
