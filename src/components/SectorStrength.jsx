import Card from "./Card";
import { sectors } from "../data/mockData";

export default function SectorStrength() {
  return (
    <Card title="SECTOR STRENGTH" className="sector-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>SECTOR</th>
            <th>1D % CHG</th>
            <th>TREND</th>
          </tr>
        </thead>

        <tbody>
          {sectors.map((row) => (
            <tr key={row[0]}>
              <td>{row[0]}</td>
              <td
                className={
                  row[3] === "bull"
                    ? "green"
                    : "red"
                }
              >
                {row[1]}
              </td>

              <td
                className={
                  row[3] === "bull"
                    ? "green direction"
                    : "red direction"
                }
              >
                {row[2]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}