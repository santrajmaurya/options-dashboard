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
        <div>
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
    </Card>
  );
}