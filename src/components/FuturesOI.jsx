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
                <td>{row[1]}</td>
                <td className="green">{row[2]}</td>
                <td>{row[3]}</td>
                <td className="green">{row[4]}</td>
                <td className="green signal-cell">{row[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}