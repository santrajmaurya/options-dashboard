import Card from "./Card";
import { futuresData } from "../data/mockData";

export default function FuturesOI() {
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
            {futuresData.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td className="value-strong">{row[1]}</td>
                <td className="green">{row[2]}</td>
                <td>{row[3]}</td>
                <td className="green">{row[4]}</td>
                <td className="green signal-cell">
                  {row[5]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="futures-summary">
        <SummaryItem
          label="DOMINANT POSITIONING"
          value="LONG BUILD-UP"
          valueClass="green"
        />

        <SummaryItem
          label="OI MOMENTUM"
          value="ACCELERATING ↑"
          valueClass="green"
        />

        <SummaryItem
          label="FUTURES BASIS"
          value="+21.65"
          valueClass="green"
        />

        <SummaryItem
          label="SIGNAL STRENGTH"
          value="82 / 100"
          valueClass="green"
          progress={82}
        />
      </div>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  valueClass = "",
  progress,
}) {
  return (
    <div className="futures-summary-item">
      <span>{label}</span>

      <strong className={valueClass}>
        {value}
      </strong>

      {progress !== undefined && (
        <div className="mini-progress">
          <i style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}