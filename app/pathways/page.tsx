import AuthNavbar from "../components/auth-navbar";

const pathways = [
  { track: "Career Pathways", summary: "Placeholder roadmap cards for first role, portfolio readiness, and interview preparation." },
  { track: "Creative Pathways", summary: "Placeholder roadmap cards for publishing, audience building, and brand partnerships." },
  { track: "Ownership Pathways", summary: "Placeholder roadmap cards for licensing, contracts, and long-term wealth strategy." },
];

export default function PathwaysPage() {
  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Community Collective</p>
        <h1 style={{ marginTop: 8 }}>Pathways</h1>
        <p className="muted">Step-by-step tracks to help members move from intent to action with structure.</p>
        <div className="submissions-list" style={{ marginTop: "1.25rem" }}>
          {pathways.map((pathway, idx) => (
            <article className="submission-item" key={idx}>
              <h3 style={{ margin: "0 0 0.5rem" }}>{pathway.track}</h3>
              <p style={{ margin: 0 }}>{pathway.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
