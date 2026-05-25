import Link from "next/link";

export default function HomePage() {
  return (
    <main className="premium-page">
      <section className="premium-card" style={{ maxWidth: 980, margin: "3rem auto", padding: "3rem" }}>
        <p className="muted" style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12, marginBottom: 16 }}>Verified Professional Access</p>
        <h1 style={{ marginTop: 0, fontSize: "3rem", lineHeight: 1.05 }}>Real People. Real Game. Real Access.</h1>
        <p className="muted" style={{ fontSize: "1rem", lineHeight: 1.8, maxWidth: 680 }}>A premium platform for trusted professionals, organizations, and opportunity infrastructure. Browse verified experts, watch media, and discover vetted jobs, events, grants, mentorships, and more.</p>

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Directory first</h3>
            <p className="muted">Search verified professionals by expertise, location, and latest media. Public users browse with confidence, without a public social feed.</p>
          </article>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Media with purpose</h3>
            <p className="muted">Professionals share videos, links, and resources that support discovery and access — not noise.</p>
          </article>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Opportunities infrastructure</h3>
            <p className="muted">Jobs, internships, events, mentorships, grants and educational resources are surfaced with clarity and trust.</p>
          </article>
        </div>

        <div className="quick-links" style={{ marginTop: 28 }}>
          <Link className="gold-btn" href="/directory">Explore Directory</Link>
          <Link className="gold-btn" href="/opportunities">Browse Opportunities</Link>
          <Link className="gold-btn" href="/login">Member Sign In</Link>
        </div>
      </section>
    </main>
  );
}
