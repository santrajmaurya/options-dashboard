import Card from "./Card";

export default function StrategyEnvironment({ data }) {
  const strategies = data ?? {};

  const preferred = Array.isArray(strategies.preferred)
    ? strategies.preferred
    : [];

  const neutral = Array.isArray(strategies.neutral) ? strategies.neutral : [];

  const avoid = Array.isArray(strategies.avoid) ? strategies.avoid : [];

  const hasStrategies =
    preferred.length > 0 || neutral.length > 0 || avoid.length > 0;

  return (
    <Card title="STRATEGY ENVIRONMENT" className="strategy-card">
      <span className="subheading">RECOMMENDED STRATEGIES</span>

      {hasStrategies ? (
        <div className="strategy-list">
          {preferred.map((strategy) => (
            <StrategyRow
              key={`preferred-${strategy}`}
              strategy={strategy}
              type="preferred"
              label="MOST SUITABLE"
            />
          ))}

          {neutral.map((strategy) => (
            <StrategyRow
              key={`neutral-${strategy}`}
              strategy={strategy}
              type="neutral"
              label="SUITABLE"
            />
          ))}

          {avoid.map((strategy) => (
            <StrategyRow
              key={`avoid-${strategy}`}
              strategy={strategy}
              type="avoid"
              label="NOT PREFERRED"
            />
          ))}
        </div>
      ) : (
        <div className="strategy-empty">
          No strategy recommendations available.
        </div>
      )}
    </Card>
  );
}

function StrategyRow({ strategy, type, label }) {
  const className =
    type === "preferred"
      ? "strategy-row preferred"
      : type === "avoid"
        ? "strategy-row avoid"
        : "strategy-row";

  return (
    <div className={className}>
      <span>{strategy}</span>

      <small>{label}</small>
    </div>
  );
}
