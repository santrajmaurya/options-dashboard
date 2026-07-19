import Card from "./Card";
import {
  supports,
  resistances,
} from "../data/mockData";

function SegmentedBar({ score, type }) {
  const segments = 10;
  const active = Math.round(score / 10);

  return (
    <div className="segmented-bar">
      {Array.from({ length: segments }).map((_, index) => (
        <span
          key={index}
          className={
            index < active
              ? type === "support"
                ? "segment support-active"
                : "segment resistance-active"
              : "segment"
          }
        />
      ))}
    </div>
  );
}

export default function SupportResistance() {
  return (
    <Card
      title="SUPPORT & RESISTANCE (DYNAMIC)"
      className="support-card"
    >
      <div className="sr-columns">
        <div>
          <h4 className="green">SUPPORT</h4>

          {supports.map((item) => (
            <div className="sr-row" key={item.level}>
              <span>{item.level}</span>

              <SegmentedBar
                score={item.score}
                type="support"
              />

              <strong>{item.score}/100</strong>
            </div>
          ))}
        </div>

        <div>
          <h4 className="red">RESISTANCE</h4>

          {resistances.map((item) => (
            <div className="sr-row" key={item.level}>
              <span>{item.level}</span>

              <SegmentedBar
                score={item.score}
                type="resistance"
              />

              <strong>{item.score}/100</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="price-location">
        <div className="price-location-header">
          <span>CURRENT PRICE LOCATION</span>
          <strong>25,152.35</strong>
        </div>

        <div className="location-line">
          <span>24,700</span>

          <div>
            <i />
          </div>

          <span>25,500</span>
        </div>
      </div>

      <div className="sr-intelligence">
        <div>
          <span>NEAREST SUPPORT</span>
          <strong className="green">25,000</strong>
          <small>-152.35 (-0.61%)</small>
        </div>

        <div>
          <span>NEAREST RESISTANCE</span>
          <strong className="red">25,200</strong>
          <small>+47.65 (+0.19%)</small>
        </div>

        <div>
          <span>OI VELOCITY</span>
          <strong className="green">
            PUT WRITING ↑
          </strong>
          <small>Increasing at 25,100</small>
        </div>

        <div>
          <span>OI CHANGE</span>
          <strong className="yellow">
            +11.2 L
          </strong>
          <small>ATM Put OI</small>
        </div>
      </div>

      <div className="sr-risk">
        <span>PRICE POSITION</span>

        <strong className="yellow">
          ⚠ CLOSE TO RESISTANCE
        </strong>

        <small>
          Resistance 25,200 is only 47.65 points away
        </small>
      </div>
    </Card>
  );
}