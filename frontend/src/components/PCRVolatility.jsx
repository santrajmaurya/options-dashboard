import Card from "./Card";

export default function PCRVolatility({ optionChain, vix }) {
  const options = optionChain ?? {};
  const vixData = vix ?? {};

  const pcrOI = toNumber(options.pcr_oi);
  const pcrVolume = toNumber(options.pcr_volume);

  const vixValue = toNumber(vixData.value);
  const vixChange = toNumber(vixData.change);
  const vixChangePercent = toNumber(vixData.change_percent);

  const pcrOIStatus = getPCRStatus(pcrOI);
  const pcrVolumeStatus = getPCRStatus(pcrVolume);

  const vixTrend =
    vixChange > 0 ? "RISING ↑" : vixChange < 0 ? "FALLING ↓" : "UNCHANGED";

  const vixTrendClass =
    vixChange > 0 ? "red" : vixChange < 0 ? "green" : "yellow";

  const volatilityRegime = getVolatilityRegime(vixValue);

  const environment = getOptionSellingEnvironment(vixValue, vixChange);

  return (
    <Card title="PCR & VOLATILITY" className="pcr-card">
      <div className="pcr-main">
        <PCRMetric
          title="PCR (OI)"
          value={formatNumber(pcrOI)}
          status={pcrOIStatus.label}
          statusClass={pcrOIStatus.className}
        />

        <PCRMetric
          title="PCR (VOLUME)"
          value={formatNumber(pcrVolume)}
          status={pcrVolumeStatus.label}
          statusClass={pcrVolumeStatus.className}
        />

        <div className="vix-metric">
          <span className="metric-title">INDIA VIX</span>

          <strong>{formatNumber(vixValue)}</strong>

          <b className={vixTrendClass}>
            {formatSignedNumber(vixChange)}
            {" ("}
            {formatSignedPercent(vixChangePercent)}
            {")"}
          </b>

          <div className="vix-details">
            <span>PREVIOUS</span>

            <strong>{formatNumber(vixData.previous)}</strong>
          </div>
        </div>
      </div>

      <div className="volatility-regime">
        <div>
          <span>VOLATILITY REGIME</span>

          <strong className={volatilityRegime.className}>
            {volatilityRegime.label}
          </strong>
        </div>

        <div>
          <span>PCR OI</span>

          <strong>{formatNumber(pcrOI)}</strong>
        </div>

        <div>
          <span>VIX TREND</span>

          <strong className={vixTrendClass}>{vixTrend}</strong>
        </div>
      </div>

      <div className="volatility-insight">
        <span>OPTION SELLING ENVIRONMENT</span>

        <strong className={environment.className}>{environment.label}</strong>

        <small>{environment.description}</small>
      </div>
    </Card>
  );
}

function PCRMetric({ title, value, status, statusClass }) {
  return (
    <div className="pcr-metric">
      <span className="metric-title">{title}</span>

      <strong>{value}</strong>

      <b className={statusClass}>{status}</b>
    </div>
  );
}

function getPCRStatus(value) {
  if (!Number.isFinite(value)) {
    return {
      label: "N/A",
      className: "yellow",
    };
  }

  if (value >= 1.1) {
    return {
      label: "BULLISH",
      className: "green",
    };
  }

  if (value <= 0.8) {
    return {
      label: "BEARISH",
      className: "red",
    };
  }

  return {
    label: "NEUTRAL",
    className: "yellow",
  };
}

function getVolatilityRegime(value) {
  if (!Number.isFinite(value)) {
    return {
      label: "UNKNOWN",
      className: "yellow",
    };
  }

  if (value >= 20) {
    return {
      label: "HIGH",
      className: "red",
    };
  }

  if (value >= 15) {
    return {
      label: "ELEVATED",
      className: "yellow",
    };
  }

  return {
    label: "NORMAL",
    className: "green",
  };
}

function getOptionSellingEnvironment(vix, vixChange) {
  if (!Number.isFinite(vix)) {
    return {
      label: "UNKNOWN",
      className: "yellow",
      description: "Volatility data is not currently available.",
    };
  }

  if (vix >= 20) {
    return {
      label: "HIGH RISK",
      className: "red",
      description:
        "Premiums are elevated, but volatility risk is high. Prefer defined-risk strategies.",
    };
  }

  if (vix >= 15) {
    return {
      label: "FAVORABLE",
      className: "green",
      description:
        vixChange > 0
          ? "Premiums are elevated, but volatility is rising. Prefer defined-risk option selling strategies."
          : "Elevated option premiums may support option selling strategies with disciplined risk management.",
    };
  }

  return {
    label: "SELECTIVE",
    className: "yellow",
    description:
      "Volatility is relatively low. Option premiums may offer less compensation for risk.",
  };
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : Number.NaN;
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toFixed(2);
}

function formatSignedNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(2)}`;
}

function formatSignedPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}
