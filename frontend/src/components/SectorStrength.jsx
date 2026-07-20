import Card from "./Card";

export default function SectorStrength({ data = [] }) {
  const sectors = Array.isArray(data) ? data : [];

  return (
    <Card title="SECTOR STRENGTH" className="sector-card">
      {sectors.length === 0 ? (
        <div className="sector-empty">No live sector data available</div>
      ) : (
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
              const changePercent = Number(sector.change_percent ?? 0);
              const isPositive = changePercent >= 0;
              const direction =
                sector.direction ?? (isPositive ? "UP" : "DOWN");

              return (
                <tr key={sector.instrument_key ?? sector.name}>
                  <td>{sector.name}</td>

                  <td className={isPositive ? "green" : "red"}>
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </td>

                  <td className={`direction ${isPositive ? "green" : "red"}`}>
                    {direction}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
