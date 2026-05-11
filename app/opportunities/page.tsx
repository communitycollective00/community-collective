import AuthNavbar from "../components/auth-navbar";

const opportunities = [
  { title: "Casting + Audition Calls", type: "Creative", detail: "Placeholder listings for upcoming castings, open auditions, and creator submissions." },
  { title: "Jobs + Internships", type: "Career", detail: "Placeholder listings for paid roles, apprenticeships, and growth opportunities." },
  { title: "Funding + Grants", type: "Capital", detail: "Placeholder listings for grant cycles, sponsorships, and support programs." },
];

export default function OpportunitiesPage() {
  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Community Collective</p>
        <h1 style={{ marginTop: 8 }}>Opportunities</h1>
        <p className="muted">A public feed of pathways to work, visibility, and long-term momentum.</p>
        <div className="submissions-list" style={{ marginTop: "1.25rem" }}>
          {opportunities.map((opportunity, idx) => (
            <article className="submission-item" key={idx}>
              <h3 style={{ margin: "0 0 0.25rem" }}>{opportunity.title}</h3>
              <p className="muted" style={{ margin: "0 0 0.5rem" }}>{opportunity.type}</p>
              <p style={{ margin: 0 }}>{opportunity.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
