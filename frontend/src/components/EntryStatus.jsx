import { Hourglass } from "lucide-react";

import Card from "./Card";

export default function EntryStatus({ data }) {
  const entry = data ?? {};

  const status = entry.status ?? "WAIT";

  const currentPrice = toNumber(entry.current_price);

  const entryLow = toNumber(entry.entry_low);

  const entryHigh = toNumber(entry.entry_high);

  const invalidation = toNumber(entry.invalidation);

  const reasons = Array.isArray(entry.reasons) ? entry.reasons : [];

  // ======================================
  // DYNAMIC VISUAL SCALE
  // ======================================

  const prices = [currentPrice, entryLow, entryHigh, invalidation].filter(
    Number.isFinite
  );

  const rawMin = prices.length > 0 ? Math.min(...prices) : 0;

  const rawMax = prices.length > 0 ? Math.max(...prices) : 1;

  const range = rawMax - rawMin;

  const padding = range > 0 ? range * 0.2 : Math.max(rawMax * 0.01, 100);

  const scaleMin = rawMin - padding;

  const scaleMax = rawMax + padding;

  const getPosition = (price) => {
    if (!Number.isFinite(price) || scaleMax === scaleMin) {
      return 0;
    }

    const position = ((price - scaleMin) / (scaleMax - scaleMin)) * 100;

    return Math.max(0, Math.min(100, position));
  };

  const entryStart = getPosition(entryLow);

  const entryEnd = getPosition(entryHigh);

  const currentPosition = getPosition(currentPrice);

  const invalidationPosition = getPosition(invalidation);

  const positionStatus = getPositionStatus(currentPrice, entryLow, entryHigh);

  return (
    <Card title="ENTRY STATUS" className="entry-card">
      <div className="entry-layout">
        {/* STATUS */}

        <div className="entry-state">
          <div className="entry-icon">
            <Hourglass size={38} />
          </div>

          <strong>{status}</strong>

          <span className="entry-state-subtitle">
            {getStatusSubtitle(status)}
          </span>
        </div>

        {/* REASON */}

        <div className="entry-reason">
          <strong>REASON</strong>

          {reasons.length > 0 ? (
            <ul>
              {reasons.map((reason, index) => (
                <li key={`${reason}-${index}`}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p>No entry analysis available.</p>
          )}
        </div>

        {/* ENTRY ZONE */}

        <div className="entry-zone-enhanced">
          <div className="entry-zone-header">
            <span>BEST ENTRY ZONE</span>

            <strong>
              {formatPrice(entryLow)}
              {" – "}
              {formatPrice(entryHigh)}
            </strong>
          </div>

          {/* PRICE RANGE */}

          <div className="entry-range-chart">
            <div className="entry-range-top-labels">
              <span>{formatPrice(scaleMin)}</span>

              <span>{formatPrice(scaleMax)}</span>
            </div>

            <div className="entry-range-track">
              {/* Entry Zone */}

              <div
                className="entry-zone-range"
                style={{
                  left: `${entryStart}%`,

                  width: `${Math.max(0, entryEnd - entryStart)}%`,
                }}
              />

              {/* Invalidation */}

              <div
                className="invalidation-marker"
                style={{
                  left: `${invalidationPosition}%`,
                }}
              />

              {/* Current Price */}

              <div
                className="current-price-marker"
                style={{
                  left: `${currentPosition}%`,
                }}
              >
                <div className="current-price-tooltip">
                  <span>NIFTY</span>

                  <strong>{formatPrice(currentPrice)}</strong>
                </div>

                <i />
              </div>
            </div>

            {/* Entry Labels */}

            <div className="entry-zone-price-labels">
              <span
                style={{
                  left: `${entryStart}%`,
                }}
              >
                {formatPrice(entryLow)}
              </span>

              <span
                style={{
                  left: `${entryEnd}%`,
                }}
              >
                {formatPrice(entryHigh)}
              </span>
            </div>
          </div>

          {/* POSITION STATUS */}

          <div className="entry-distance-status">
            <span>CURRENT POSITION</span>

            <strong className={positionStatus.className}>
              {positionStatus.label}
            </strong>
          </div>

          {/* INVALIDATION */}

          <div className="entry-invalidation">
            <div>
              <span>INVALIDATION</span>

              <strong>Below {formatPrice(invalidation)}</strong>
            </div>

            <small>15 Min Close</small>
          </div>
        </div>
      </div>
    </Card>
  );
}

function getPositionStatus(currentPrice, entryLow, entryHigh) {
  if (
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(entryLow) ||
    !Number.isFinite(entryHigh)
  ) {
    return {
      label: "UNKNOWN",
      className: "yellow",
    };
  }

  if (currentPrice > entryHigh) {
    return {
      label: "▲ ABOVE ENTRY ZONE",
      className: "yellow",
    };
  }

  if (currentPrice < entryLow) {
    return {
      label: "▼ BELOW ENTRY ZONE",
      className: "red",
    };
  }

  return {
    label: "● INSIDE ENTRY ZONE",
    className: "green",
  };
}

function getStatusSubtitle(status) {
  const normalized = String(status).toUpperCase();

  if (normalized === "WAIT") {
    return "NO ENTRY YET";
  }

  if (normalized.includes("READY")) {
    return "ENTRY CONDITIONS MET";
  }

  if (normalized.includes("AVOID")) {
    return "ENTRY NOT RECOMMENDED";
  }

  return "ENTRY STATUS";
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : Number.NaN;
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
