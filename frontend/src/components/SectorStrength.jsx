import Card from "./Card";

export default function SectorStrength({ data = [] }) {
  const sectors = Array.isArray(data) ? data : [];

  return (
    <Card title="SECTOR STRENGTH" className="sector-card">
      {sectors.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>SECTOR</th>

              <th>1D % CHG</th>

              <th>TREND</th>
            </tr>
          </thead>

          <tbody>
            {sectors.map((sector) => {
              const change = Number(sector.change_percent);

              const isPositive = Number.isFinite(change) && change >= 0;

              const trend = sector.trend ?? (isPositive ? "UP" : "DOWN");

              return (
                <tr key={sector.name}>
                  <td>{sector.name}</td>

                  <td className={isPositive ? "green" : "red"}>
                    {formatChange(change)}
                  </td>

                  <td className={`direction ${isPositive ? "green" : "red"}`}>
                    {trend}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="sector-empty">Sector data not available.</div>
      )}
    </Card>
  );
}

function formatChange(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}
