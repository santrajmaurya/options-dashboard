import Card from "./Card";

export default function FuturesOI({ data }) {
  const futures = data ?? {};

  const price = Number(futures.price ?? 0);
  const basis = Number(futures.basis ?? 0);
  const openInterest = Number(futures.oi ?? 0);
  const oiChangePercent = Number(futures.oi_change_percent ?? 0);

  const signal = futures.signal ?? "NO SIGNAL";

  // ---------------------------------------------
  // FORMAT PRICE
  // ---------------------------------------------

  const formatPrice = (value) => {
    if (!Number.isFinite(value) || value === 0) {
      return "--";
    }

    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------------------------------------------
  // FORMAT OI
  // ---------------------------------------------

  const formatOI = (value) => {
    if (!Number.isFinite(value) || value === 0) {
      return "--";
    }

    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Cr`;
    }

    if (value >= 100000) {
      return `${(value / 100000).toFixed(2)} L`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} K`;
    }

    return value.toLocaleString("en-IN");
  };

  // ---------------------------------------------
  // SIGNAL CLASS
  // ---------------------------------------------

  const getSignalClass = (value) => {
    const normalized = String(value).toUpperCase();

    if (
      normalized.includes("LONG BUILDUP") ||
      normalized.includes("LONG BUILD-UP") ||
      normalized.includes("SHORT COVERING")
    ) {
      return "green";
    }

    if (
      normalized.includes("SHORT BUILDUP") ||
      normalized.includes("SHORT BUILD-UP") ||
      normalized.includes("LONG UNWINDING")
    ) {
      return "red";
    }

    return "yellow";
  };

  // ---------------------------------------------
  // DERIVED VALUES
  // ---------------------------------------------

  const signalClass = getSignalClass(signal);

  const oiChangeClass = oiChangePercent >= 0 ? "green" : "red";

  const basisClass = basis >= 0 ? "green" : "red";

  const formattedOIChange = Number.isFinite(oiChangePercent)
    ? `${oiChangePercent >= 0 ? "+" : ""}${oiChangePercent.toFixed(2)}%`
    : "--";

  const formattedBasis = Number.isFinite(basis)
    ? `${basis >= 0 ? "+" : ""}${basis.toFixed(2)}`
    : "--";

  // We currently do not have price-change data
  // in /api/dashboard.futures.
  const priceChange = "--";

  // Temporary derived strength until backend
  // provides an actual positioning score.
  const signalStrength = getSignalStrength(signal, oiChangePercent);

  const oiMomentum = getOIMomentum(oiChangePercent);

  return (
    <Card title="FUTURES PRICE & OI" className="futures-card">
      <div className="table-scroll">
        <table className="data-table futures-table">
          <thead>
            <tr>
              <th>TIMEFRAME</th>
              <th>PRICE</th>
              <th>PRICE CHG</th>
              <th>OI</th>
              <th>OI CHG</th>
              <th>SIGNAL</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>CURRENT</td>

              <td className="value-strong">{formatPrice(price)}</td>

              <td>{priceChange}</td>

              <td>{formatOI(openInterest)}</td>

              <td className={oiChangeClass}>{formattedOIChange}</td>

              <td className={`${signalClass} signal-cell`}>{signal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="futures-summary">
        <SummaryItem
          label="DOMINANT POSITIONING"
          value={formatSignal(signal)}
          valueClass={signalClass}
        />

        <SummaryItem
          label="OI MOMENTUM"
          value={oiMomentum.label}
          valueClass={oiMomentum.className}
        />

        <SummaryItem
          label="FUTURES BASIS"
          value={formattedBasis}
          valueClass={basisClass}
        />

        <SummaryItem
          label="SIGNAL STRENGTH"
          value={`${signalStrength} / 100`}
          valueClass={signalClass}
          progress={signalStrength}
        />
      </div>
    </Card>
  );
}

function SummaryItem({ label, value, valueClass = "", progress }) {
  return (
    <div className="futures-summary-item">
      <span>{label}</span>

      <strong className={valueClass}>{value}</strong>

      {progress !== undefined && (
        <div className="mini-progress">
          <i
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function formatSignal(signal) {
  return String(signal)
    .toUpperCase()
    .replace("LONG BUILDUP", "LONG BUILD-UP")
    .replace("SHORT BUILDUP", "SHORT BUILD-UP");
}

function getOIMomentum(oiChangePercent) {
  if (!Number.isFinite(oiChangePercent)) {
    return {
      label: "--",
      className: "",
    };
  }

  if (oiChangePercent >= 5) {
    return {
      label: "ACCELERATING ↑",
      className: "green",
    };
  }

  if (oiChangePercent > 0) {
    return {
      label: "INCREASING ↑",
      className: "green",
    };
  }

  if (oiChangePercent <= -5) {
    return {
      label: "DECLINING ↓",
      className: "red",
    };
  }

  if (oiChangePercent < 0) {
    return {
      label: "WEAKENING ↓",
      className: "red",
    };
  }

  return {
    label: "FLAT",
    className: "yellow",
  };
}

function getSignalStrength(signal, oiChangePercent) {
  const normalized = String(signal).toUpperCase();

  const oiStrength = Math.min(Math.abs(Number(oiChangePercent) || 0) * 5, 40);

  let baseStrength = 40;

  if (
    normalized.includes("LONG BUILDUP") ||
    normalized.includes("SHORT BUILDUP")
  ) {
    baseStrength = 55;
  }

  if (
    normalized.includes("SHORT COVERING") ||
    normalized.includes("LONG UNWINDING")
  ) {
    baseStrength = 45;
  }

  return Math.min(100, Math.round(baseStrength + oiStrength));
}
