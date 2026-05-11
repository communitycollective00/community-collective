const opportunities = [
  { type: "Casting Call", title: "Music Video Lead", meta: "Los Angeles • Paid", color: "gold" },
  { type: "Internship", title: "Creative Strategy Intern", meta: "Remote • Summer", color: "blue" },
  { type: "Apprenticeship", title: "Electrical Trade Program", meta: "Atlanta • Stipend", color: "green" },
];

export default function OpportunitiesPreview() {
  return (
    <section id="opportunities" className="cc-section">
      <div className="cc-wrap">
        <p className="cc-kicker">Live Board</p>
        <h2 className="cc-h2">Opportunities Preview</h2>
        <div className="cc-grid cc-grid-3">
          {opportunities.map((item) => (
            <article key={item.title} className={`cc-card cc-opp ${item.color}`}>
              <p className="cc-tag">{item.type}</p>
              <h3>{item.title}</h3>
              <p className="cc-muted">{item.meta}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
