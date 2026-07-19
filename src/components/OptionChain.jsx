import Card from "./Card";
import { optionChain } from "../data/mockData";

export default function OptionChain() {
  return (
    <Card title="OPTION CHAIN SNAPSHOT (ATM ± 5)" className="option-card">
      <div className="option-meta">
        <span>SPOT <strong>25,152.35</strong></span>
        <span>ATM STRIKE <strong>25,100</strong></span>
      </div>

      <div className="option-labels">
        <span className="green">CALLS</span>
        <span />
        <span className="red">PUTS</span>
      </div>

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
          {optionChain.map((row) => (
            <tr
              key={row[2]}
              className={row[2] === "25,100" ? "atm-highlight" : ""}
            >
              <td>{row[0]}</td>
              <td className="green">{row[1]}</td>
              <td className="strike">{row[2]}</td>
              <td>{row[3]}</td>
              <td className="green">{row[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="max-oi">
        <strong className="red">MAX CALL OI&nbsp; 25,200 (48.2 L)</strong>
        <strong className="green">MAX PUT OI&nbsp; 25,100 (64.5 L)</strong>
      </div>
    </Card>
  );
}