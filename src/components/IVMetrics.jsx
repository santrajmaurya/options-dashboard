import Card from "./Card";

const data = [
  ["ATM IV", "14.85", "+0.62 (4.35%)", "Rising"],
  ["Call IV", "15.10", "+0.70 (4.85%)", "Rising"],
  ["Put IV", "14.60", "+0.55 (3.91%)", "Rising"],
  ["IV Percentile (1Y)", "72%", "—", "Elevated"],
];

export default function IVMetrics() {
  return (
    <Card title="IV METRICS" className="iv-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>METRIC</th>
            <th>VALUE</th>
            <th>CHANGE</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row[0]}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td className="green">{row[2]}</td>
              <td
                className={
                  row[3] === "Elevated"
                    ? "yellow"
                    : "red"
                }
              >
                {row[3]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}