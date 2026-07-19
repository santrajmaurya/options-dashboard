import Card from "./Card";

export default function StrategyEnvironment() {
  return (
    <Card
      title="STRATEGY ENVIRONMENT"
      className="strategy-card"
    >
      <span className="subheading">
        RECOMMENDED STRATEGIES
      </span>

      <div className="strategy-list">
        <div className="strategy-row preferred">
          <span>Bull Put Spread</span>
          <small>MOST SUITABLE</small>
        </div>

        <div className="strategy-row">
          <span>Iron Condor</span>
          <small>SUITABLE</small>
        </div>

        <div className="strategy-row avoid">
          <span>Bear Call Spread</span>
          <small>NOT PREFERRED</small>
        </div>
      </div>
    </Card>
  );
}