import Card from "./Card";

export default function RiskEvents() {
  return (
    <Card title="RISK & EVENTS" className="risk-card">
      <div className="risk-layout">
        <div>
          <span className="subheading">EVENT CALENDAR</span>

          <div className="event-row">
            <span>02:00 PM</span>
            <p>India Manufacturing PMI</p>
          </div>

          <div className="event-row">
            <span>04:00 PM</span>
            <p>USA S&P Global PMI</p>
          </div>

          <div className="event-row">
            <span>08:30 PM</span>
            <p>USA New Home Sales</p>
          </div>
        </div>

        <div className="risk-level">
          <div>
            <span>RISK LEVEL</span>
            <strong>MODERATE</strong>
          </div>

          <ul>
            <li>No major high impact events today</li>
            <li>Overnight Global Sentiment: Neutral</li>
            <li>Use defined risk strategies</li>
            <li>Keep position size moderate</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}