import AuthNavbar from "../components/auth-navbar";
import Link from "next/link";

const opportunities = [
  { title: "Jobs + Internships", category: "Career", detail: "Paid roles, apprenticeships, and entry-level growth pathways from verified organizations." },
  { title: "Mentorships + Coaching", category: "Development", detail: "Guided learning, mentoring sessions, and career support from trusted professionals." },
  { title: "Events + Workshops", category: "Experience", detail: "Live sessions, panels, and resource-driven events that connect people to the right room." },
  { title: "Auditions + Casting Calls", category: "Creative", detail: "Auditions, talent calls, and studio opportunities shared by industry experts." },
  { title: "Grants + Funding", category: "Capital", detail: "Non-dilutive grants, sponsorships, and supported funding opportunities for growing professionals." },
  { title: "Educational Resources", category: "Learning", detail: "Courses, guides, and resource libraries built to help users translate access into outcomes." },
];

export default function OpportunitiesPage() {
  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Verified Opportunities</p>
        <h1 style={{ marginTop: 8 }}>Opportunities</h1>
        <p className="muted">A trusted collection of pathways, not a noisy listing. Browse curated jobs, mentorships, events, auditions, grants, and educational resources.</p>
        <div className="submissions-list" style={{ marginTop: "1.25rem" }}>
          {opportunities.length === 0 ? (
            <article className="submission-item">
              <h3>No opportunities posted yet</h3>
              <p className="muted">Check back soon.</p>
            </article>
          ) : (
            opportunities.map((opportunity, idx) => {
              const slug = opportunity.title.replace(/[\s+\\/+,&]+/g, "-").toLowerCase();
              return (
                <Link key={idx} href={`/opportunities?filter=${encodeURIComponent(slug)}`} className="submission-item">
                  <h3 style={{ margin: "0 0 0.25rem" }}>{opportunity.title}</h3>
                  <p className="muted" style={{ margin: "0 0 0.5rem" }}>{opportunity.category}</p>
                  <p style={{ margin: 0 }}>{opportunity.detail}</p>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
