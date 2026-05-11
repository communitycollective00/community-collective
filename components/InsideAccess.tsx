const accessItems = [
  { icon: "🎤", title: "Creator Sessions", desc: "Direct conversations with working creators and executives." },
  { icon: "📈", title: "Business Blueprint", desc: "Tactical breakdowns for monetizing your skills and network." },
  { icon: "🎬", title: "Behind The Scenes", desc: "Exclusive production and industry process content." },
];

export default function InsideAccess() {
  return (
    <section id="inside-access" className="cc-section">
      <div className="cc-wrap">
        <p className="cc-kicker">Premium Content</p>
        <h2 className="cc-h2">Inside Access</h2>
        <div className="cc-grid cc-grid-3">
          {accessItems.map((item) => (
            <article key={item.title} className="cc-card cc-access-card">
              <div className="cc-access-thumb">{item.icon}</div>
              <h3>{item.title}</h3>
              <p className="cc-muted">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
