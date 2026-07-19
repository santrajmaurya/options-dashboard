import Card from "./Card";

export default function OptionChain({ data, nifty }) {
  const chain = data ?? {};

  // ---------------------------------------------
  // API DATA
  // ---------------------------------------------

  const spotPrice = Number(nifty?.ltp ?? 0);

  const atmStrike = Number(chain.atm_strike ?? 0);

  const maxCallOIStrike = Number(chain.max_call_oi_strike ?? 0);

  const maxPutOIStrike = Number(chain.max_put_oi_strike ?? 0);

  const maxCallOI = Number(chain.max_call_oi ?? 0);

  const maxPutOI = Number(chain.max_put_oi ?? 0);

  const pcrOI = Number(chain.pcr_oi ?? 0);

  const pcrVolume = Number(chain.pcr_volume ?? 0);

  const strikes = Array.isArray(chain.strikes) ? chain.strikes : [];

  // ---------------------------------------------
  // FORMAT PRICE
  // ---------------------------------------------

  const formatPrice = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "--";
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------------------------------------------
  // FORMAT STRIKE
  // ---------------------------------------------

  const formatStrike = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "--";
    }

    return number.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };

  // ---------------------------------------------
  // FORMAT OI IN LAKHS
  //
  // Column already says OI (L), so we only
  // display the numeric value.
  // ---------------------------------------------

  const formatOIValue = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "--";
    }

    return (number / 100000).toFixed(1);
  };

  // ---------------------------------------------
  // FORMAT MAX OI
  //
  // Here we include "L" because this value
  // appears outside the table.
  // ---------------------------------------------

  const formatMaxOI = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "--";
    }

    return `${(number / 100000).toFixed(1)} L`;
  };

  // ---------------------------------------------
  // FORMAT PCR
  // ---------------------------------------------

  const formatPCR = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "--";
    }

    return number.toFixed(2);
  };

  return (
    <Card title="OPTION CHAIN SNAPSHOT (ATM ± 5)" className="option-card">
      {/* OPTION CHAIN META */}

      <div className="option-meta">
        <span>
          SPOT <strong>{formatPrice(spotPrice)}</strong>
        </span>

        <span>
          ATM STRIKE <strong>{formatStrike(atmStrike)}</strong>
        </span>

        <span>
          PCR OI <strong>{formatPCR(pcrOI)}</strong>
        </span>

        <span>
          PCR VOL <strong>{formatPCR(pcrVolume)}</strong>
        </span>
      </div>

      {/* CALL / PUT LABELS */}

      <div className="option-labels">
        <span className="green">CALLS</span>

        <span />

        <span className="red">PUTS</span>
      </div>

      {/* OPTION CHAIN TABLE */}

      <div className="table-scroll">
        <table className="data-table option-table">
          <thead>
            <tr>
              <th>OI (L)</th>

              <th>CHG OI (L)</th>

              <th>STRIKE</th>

              <th>OI (L)</th>

              <th>CHG OI (L)</th>
            </tr>
          </thead>

          <tbody>
            {strikes.length > 0 ? (
              strikes.map((row) => {
                const strike = Number(row.strike);

                const isATM = strike === atmStrike;

                const isMaxCall = strike === maxCallOIStrike;

                const isMaxPut = strike === maxPutOIStrike;

                return (
                  <tr key={row.strike} className={isATM ? "atm-highlight" : ""}>
                    {/* CALL OI */}

                    <td className={isMaxCall ? "red value-strong" : ""}>
                      {formatOIValue(row.call_oi)}
                    </td>

                    {/* CALL OI CHANGE */}

                    <td className="green">
                      {formatOIValue(row.call_oi_change)}
                    </td>

                    {/* STRIKE */}

                    <td className="strike">
                      {formatStrike(row.strike)}

                      {isATM && <small className="atm-label">ATM</small>}
                    </td>

                    {/* PUT OI */}

                    <td className={isMaxPut ? "green value-strong" : ""}>
                      {formatOIValue(row.put_oi)}
                    </td>

                    {/* PUT OI CHANGE */}

                    <td className="green">
                      {formatOIValue(row.put_oi_change)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="table-empty">
                  Option chain data unavailable
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MAX OI SUMMARY */}

      <div className="max-oi">
        <strong className="red">
          MAX CALL OI&nbsp;
          {formatStrike(maxCallOIStrike)}
          {" ("}
          {formatMaxOI(maxCallOI)}
          {")"}
        </strong>

        <strong className="green">
          MAX PUT OI&nbsp;
          {formatStrike(maxPutOIStrike)}
          {" ("}
          {formatMaxOI(maxPutOI)}
          {")"}
        </strong>
      </div>
    </Card>
  );
}
