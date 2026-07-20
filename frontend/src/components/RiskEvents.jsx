import Card from "./Card";

export default function RiskEvents({ data }) {
  const risk = data ?? {};

  const score = toNumber(risk.score);
  const level = risk.level ?? "UNKNOWN";
  const environment = risk.environment ?? "UNKNOWN";

  const reasons = Array.isArray(risk.reasons) ? risk.reasons : [];

  const riskClass = getRiskClass(level);

  return (
    <Card title="RISK & EVENTS" className="risk-card">
      <div className="risk-layout">
        <div>
          <span className="subheading">RISK ENVIRONMENT</span>

          <div className="risk-level">
            <div>
              <span>RISK SCORE</span>

              <strong className={riskClass}>{formatScore(score)}</strong>
            </div>

            <div>
              <span>ENVIRONMENT</span>

              <strong className={riskClass}>{environment}</strong>
            </div>
          </div>
        </div>

        <div className="risk-level">
          <div>
            <span>RISK LEVEL</span>

            <strong className={riskClass}>{level}</strong>
          </div>

          {reasons.length > 0 ? (
            <ul>
              {reasons.map((reason, index) => (
                <li key={`${reason}-${index}`}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p>No risk analysis is currently available.</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function getRiskClass(level) {
  const normalized = String(level).toUpperCase();

  if (normalized.includes("HIGH") || normalized.includes("EXTREME")) {
    return "red";
  }

  if (normalized.includes("MODERATE") || normalized.includes("ELEVATED")) {
    return "yellow";
  }

  if (normalized.includes("LOW")) {
    return "green";
  }

  return "yellow";
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : Number.NaN;
}

function formatScore(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return `${Math.round(value)} / 100`;
}
