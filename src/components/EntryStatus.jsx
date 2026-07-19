import { Hourglass } from "lucide-react";
import Card from "./Card";

export default function EntryStatus() {
  return (
    <Card title="ENTRY STATUS" className="entry-card">
      <div className="entry-layout">
        <div className="entry-state">
          <Hourglass size={46} />
          <strong>WAIT</strong>
        </div>

        <div className="entry-reason">
          <strong className="yellow">REASON</strong>

          <ul>
            <li>Price extended from VWAP</li>
            <li>Wait for pullback / retest of 25,100 – 25,050 zone</li>
            <li>Watch for Put Writing Confirmation</li>
          </ul>
        </div>

        <div className="entry-zone">
          <span>BEST ENTRY ZONE</span>
          <strong>25,050 – 25,100</strong>

          <hr />

          <span>INVALIDATION</span>
          <p>Below 24,900 (15m Close)</p>
        </div>
      </div>
    </Card>
  );
}