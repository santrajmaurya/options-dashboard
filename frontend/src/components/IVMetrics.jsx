import Card from "./Card";

export default function IVMetrics({ data }) {
  const volatility = data ?? {};

  const atmIV = toNumber(volatility.atm_iv);

  const ivPercentile = toNumber(volatility.iv_percentile);

  const ivRank = toNumber(volatility.iv_rank);

  const regime = volatility.regime ?? "UNKNOWN";

  const metrics = [
    {
      name: "ATM IV",
      value: formatPercent(atmIV),
      status: getIVStatus(atmIV),
    },

    {
      name: "IV PERCENTILE (1Y)",
      value: formatPercent(ivPercentile),
      status: getPercentileStatus(ivPercentile),
    },

    {
      name: "IV RANK",
      value: formatPercent(ivRank),
      status: getPercentileStatus(ivRank),
    },

    {
      name: "VOLATILITY REGIME",
      value: regime,
      status: getRegimeStatus(regime),
    },
  ];

  return (
    <Card title="IV METRICS" className="iv-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>METRIC</th>

            <th>VALUE</th>

            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.name}>
              <td>{metric.name}</td>

              <td className="value-strong">{metric.value}</td>

              <td className={metric.status.className}>{metric.status.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function getIVStatus(value) {
  if (!Number.isFinite(value)) {
    return {
      label: "N/A",
      className: "yellow",
    };
  }

  if (value >= 25) {
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

function getPercentileStatus(value) {
  if (!Number.isFinite(value)) {
    return {
      label: "N/A",
      className: "yellow",
    };
  }

  if (value >= 75) {
    return {
      label: "HIGH",
      className: "red",
    };
  }

  if (value >= 50) {
    return {
      label: "ELEVATED",
      className: "yellow",
    };
  }

  return {
    label: "LOW",
    className: "green",
  };
}

function getRegimeStatus(regime) {
  const normalized = String(regime).toUpperCase();

  if (normalized.includes("HIGH")) {
    return {
      label: normalized,
      className: "red",
    };
  }

  if (normalized.includes("ELEVATED")) {
    return {
      label: normalized,
      className: "yellow",
    };
  }

  return {
    label: normalized,
    className: "green",
  };
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : Number.NaN;
}

function formatPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${number.toFixed(2)}%`;
}
