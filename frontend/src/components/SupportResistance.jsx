import Card from "./Card";

function SegmentedBar({ score, type }) {
  const segments = 10;

  const normalizedScore = Math.max(0, Math.min(100, Number(score) || 0));

  const active = Math.round(normalizedScore / 10);

  return (
    <div className="segmented-bar">
      {Array.from({
        length: segments,
      }).map((_, index) => (
        <span
          key={index}
          className={
            index < active
              ? type === "support"
                ? "segment " + "support-active"
                : "segment " + "resistance-active"
              : "segment"
          }
        />
      ))}
    </div>
  );
}

export default function SupportResistance({ data, nifty, optionChain }) {
  const levels = data ?? {};

  const chain = optionChain ?? {};

  const currentPrice = Number(nifty?.ltp ?? 0);

  const supports = [levels.support_1, levels.support_2].filter(Boolean);

  const resistances = [levels.resistance_1, levels.resistance_2].filter(
    Boolean
  );

  const strikes = Array.isArray(chain.strikes) ? chain.strikes : [];

  const atmStrike = Number(chain.atm_strike ?? 0);

  const atmData = strikes.find((item) => Number(item.strike) === atmStrike);

  const atmPutOIChange = Number(atmData?.put_oi_change ?? 0);

  const atmCallOIChange = Number(atmData?.call_oi_change ?? 0);

  const nearestSupport = getNearestLevel(supports);

  const nearestResistance = getNearestLevel(resistances);

  const oiVelocity = getOIVelocity(atmPutOIChange, atmCallOIChange);

  const strikeValues = strikes
    .map((item) => Number(item.strike))
    .filter(Number.isFinite);

  const rangeMin = strikeValues.length > 0 ? Math.min(...strikeValues) : 0;

  const rangeMax = strikeValues.length > 0 ? Math.max(...strikeValues) : 0;

  const pricePosition = calculatePricePosition(
    currentPrice,
    rangeMin,
    rangeMax
  );

  const risk = getPriceRisk(nearestSupport, nearestResistance);

  return (
    <Card
      title={"SUPPORT & RESISTANCE " + "(DYNAMIC)"}
      className="support-card"
    >
      <div className="sr-columns">
        {/* SUPPORT */}

        <div>
          <h4 className="green">SUPPORT</h4>

          {supports.map((item) => (
            <div className="sr-row" key={item.strike}>
              <span>{formatStrike(item.strike)}</span>

              <SegmentedBar score={item.score} type="support" />

              <strong>
                {item.score}
                /100
              </strong>
            </div>
          ))}
        </div>

        {/* RESISTANCE */}

        <div>
          <h4 className="red">RESISTANCE</h4>

          {resistances.map((item) => (
            <div className="sr-row" key={item.strike}>
              <span>{formatStrike(item.strike)}</span>

              <SegmentedBar score={item.score} type={"resistance"} />

              <strong>
                {item.score}
                /100
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* CURRENT PRICE */}

      <div className="price-location">
        <div className={"price-location-header"}>
          <span>CURRENT PRICE LOCATION</span>

          <strong>{formatPrice(currentPrice)}</strong>
        </div>

        <div className="location-line">
          <span>{formatStrike(rangeMin)}</span>

          <div>
            <i
              style={{
                left: `${pricePosition}%`,
              }}
            />
          </div>

          <span>{formatStrike(rangeMax)}</span>
        </div>
      </div>

      {/* INTELLIGENCE */}

      <div className="sr-intelligence">
        <div>
          <span>NEAREST SUPPORT</span>

          <strong className="green">
            {formatStrike(nearestSupport?.strike)}
          </strong>

          <small>{formatLevelDistance(nearestSupport)}</small>
        </div>

        <div>
          <span>NEAREST RESISTANCE</span>

          <strong className="red">
            {formatStrike(nearestResistance?.strike)}
          </strong>

          <small>{formatLevelDistance(nearestResistance)}</small>
        </div>

        <div>
          <span>OI VELOCITY</span>

          <strong className={oiVelocity.className}>{oiVelocity.label}</strong>

          <small>{oiVelocity.description}</small>
        </div>

        <div>
          <span>ATM PUT OI CHANGE</span>

          <strong className={atmPutOIChange >= 0 ? "green" : "red"}>
            {formatOI(atmPutOIChange)}
          </strong>

          <small>Strike {formatStrike(atmStrike)}</small>
        </div>
      </div>

      {/* PRICE RISK */}

      <div className="sr-risk">
        <span>PRICE POSITION</span>

        <strong className={risk.className}>{risk.label}</strong>

        <small>{risk.description}</small>
      </div>
    </Card>
  );
}

function getNearestLevel(levels) {
  if (!levels.length) {
    return null;
  }

  return [...levels].sort(
    (a, b) => Math.abs(Number(a.distance)) - Math.abs(Number(b.distance))
  )[0];
}

function calculatePricePosition(price, min, max) {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min
  ) {
    return 50;
  }

  const position = ((price - min) / (max - min)) * 100;

  return Math.max(0, Math.min(100, position));
}

function getOIVelocity(putChange, callChange) {
  if (putChange > callChange) {
    return {
      label: "PUT WRITING ↑",

      className: "green",

      description: "Put OI addition " + "stronger near ATM",
    };
  }

  if (callChange > putChange) {
    return {
      label: "CALL WRITING ↑",

      className: "red",

      description: "Call OI addition " + "stronger near ATM",
    };
  }

  return {
    label: "BALANCED",

    className: "yellow",

    description: "Call and Put OI " + "changes are balanced",
  };
}

function getPriceRisk(support, resistance) {
  if (!support && !resistance) {
    return {
      label: "NO DATA",

      className: "yellow",

      description: "Support and resistance " + "data unavailable",
    };
  }

  const supportDistance = support
    ? Math.abs(Number(support.distance))
    : Infinity;

  const resistanceDistance = resistance
    ? Math.abs(Number(resistance.distance))
    : Infinity;

  if (resistanceDistance < supportDistance) {
    return {
      label: "⚠ CLOSE TO RESISTANCE",

      className: "yellow",

      description: `Resistance ${formatStrike(
        resistance.strike
      )} is only ${resistanceDistance.toFixed(2)} points away`,
    };
  }

  if (supportDistance < resistanceDistance) {
    return {
      label: "NEAR SUPPORT",

      className: "green",

      description: `Support ${formatStrike(
        support.strike
      )} is ${supportDistance.toFixed(2)} points away`,
    };
  }

  return {
    label: "MID RANGE",

    className: "yellow",

    description: "Price is between major " + "support and resistance",
  };
}

function formatLevelDistance(level) {
  if (!level) {
    return "--";
  }

  const distance = Number(level.distance);

  const percent = Number(level.distance_percent);

  if (!Number.isFinite(distance) || !Number.isFinite(percent)) {
    return "--";
  }

  return (
    `${distance >= 0 ? "+" : ""}${distance.toFixed(2)} ` +
    `(${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%)`
  );
}

function formatStrike(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  });
}

function formatOI(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  const formatted = (Math.abs(number) / 100000).toFixed(1);

  return `${number >= 0 ? "+" : "-"}${formatted} L`;
}
