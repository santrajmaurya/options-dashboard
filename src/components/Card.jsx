export default function Card({ title, children, className = "" }) {
  return (
    <section className={`dashboard-card ${className}`}>
      <div className="card-heading">{title}</div>
      {children}
    </section>
  );
}