import { Hourglass } from "lucide-react";
import Card from "./Card";

export default function EntryStatus() {
  // Later these values can come from Upstox/live market data
  const currentPrice = 25152.35;
  const entryLow = 25050;
  const entryHigh = 25100;
  const invalidation = 24900;

  // Visual scale
  const scaleMin = 24900;
  const scaleMax = 25200;

  const getPosition = (price) => {
    const position =
      ((price - scaleMin) / (scaleMax - scaleMin)) * 100;

    return Math.max(0, Math.min(100, position));
  };

  const entryStart = getPosition(entryLow);
  const entryEnd = getPosition(entryHigh);
  const currentPosition = getPosition(currentPrice);
  const invalidationPosition = getPosition(invalidation);

  return (
    <Card
      title="ENTRY STATUS"
      className="entry-card"
    >
      <div className="entry-layout">

        {/* WAIT STATUS */}
        <div className="entry-state">
          <div className="entry-icon">
            <Hourglass size={38} />
          </div>

          <strong>WAIT</strong>

          <span className="entry-state-subtitle">
            NO ENTRY YET
          </span>
        </div>

        {/* REASON */}
        <div className="entry-reason">
          <strong>REASON</strong>

          <ul>
            <li>
              Price extended from VWAP
            </li>

            <li>
              Wait for pullback / retest of
              25,100 – 25,050 zone
            </li>

            <li>
              Watch for Put Writing Confirmation
            </li>
          </ul>
        </div>

        {/* ENTRY ZONE */}
        <div className="entry-zone-enhanced">

          <div className="entry-zone-header">
            <span>BEST ENTRY ZONE</span>

            <strong>
              25,050 – 25,100
            </strong>
          </div>

          {/* PRICE RANGE VISUALIZATION */}
          <div className="entry-range-chart">

            {/* Labels above range */}
            <div className="entry-range-top-labels">
              <span>
                24,900
              </span>

              <span>
                25,200
              </span>
            </div>

            {/* Main Range */}
            <div className="entry-range-track">

              {/* Entry Zone Highlight */}
              <div
                className="entry-zone-range"
                style={{
                  left: `${entryStart}%`,
                  width: `${entryEnd - entryStart}%`,
                }}
              />

              {/* Invalidation Marker */}
              <div
                className="invalidation-marker"
                style={{
                  left: `${invalidationPosition}%`,
                }}
              />

              {/* Current Price Marker */}
              <div
                className="current-price-marker"
                style={{
                  left: `${currentPosition}%`,
                }}
              >
                <div className="current-price-tooltip">
                  <span>NIFTY</span>

                  <strong>
                    25,152
                  </strong>
                </div>

                <i />
              </div>
            </div>

            {/* Entry zone labels */}
            <div className="entry-zone-price-labels">
              <span
                style={{
                  left: `${entryStart}%`,
                }}
              >
                25,050
              </span>

              <span
                style={{
                  left: `${entryEnd}%`,
                }}
              >
                25,100
              </span>
            </div>

          </div>

          {/* STATUS */}
          <div className="entry-distance-status">
            <span>
              CURRENT POSITION
            </span>

            <strong>
              ▲ ABOVE ENTRY ZONE
            </strong>
          </div>

          {/* INVALIDATION */}
          <div className="entry-invalidation">
            <div>
              <span>INVALIDATION</span>

              <strong>
                Below 24,900
              </strong>
            </div>

            <small>
              15 Min Close
            </small>
          </div>

        </div>
      </div>
    </Card>
  );
}