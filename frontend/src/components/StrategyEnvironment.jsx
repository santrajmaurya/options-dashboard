import Card from "./Card";

export default function StrategyEnvironment({ data, regime }) {
  const strategies = data ?? {};

  const preferred = Array.isArray(strategies.preferred)
    ? strategies.preferred
    : [];

  const neutral = Array.isArray(strategies.neutral) ? strategies.neutral : [];

  const avoid = Array.isArray(strategies.avoid) ? strategies.avoid : [];


  const getBias = () => {
    const direction = String(regime?.direction ?? regime?.final_regime ?? "NEUTRAL").toLowerCase();
    const score = Number(regime?.score ?? 50);
    const bearish = direction.includes("bear");
    const bullish = direction.includes("bull");
    if (bearish) return score <= 35 ? { label: "STRONG BEARISH", cls: "strong-bearish" } : { label: "MILD BEARISH", cls: "mild-bearish" };
    if (bullish) return score >= 65 ? { label: "STRONG BULLISH", cls: "strong-bullish" } : { label: "MILD BULLISH", cls: "mild-bullish" };
    return { label: "NEUTRAL", cls: "neutral-bias" };
  };
  const bias = getBias();

  const hasStrategies =
    preferred.length > 0 || neutral.length > 0 || avoid.length > 0;

  return (
    <Card title="STRATEGY ENVIRONMENT" className="strategy-card">
      <div className={`strategy-bias ${bias.cls}`}><span>MARKET BIAS</span><strong>{bias.label}</strong></div>
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
