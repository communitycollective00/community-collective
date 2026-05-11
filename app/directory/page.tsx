import AuthNavbar from "../components/auth-navbar";

const directoryEntries = [
  { category: "Legal + Advocacy", description: "Placeholder trusted contacts for legal education, referral support, and advocacy." },
  { category: "Health + Wellness", description: "Placeholder resources covering mental health, care navigation, and crisis support." },
  { category: "Business + Services", description: "Placeholder professionals for finance, tax, branding, and operations." },
];

export default function DirectoryPage() {
  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Community Collective</p>
        <h1 style={{ marginTop: 8 }}>Directory</h1>
        <p className="muted">Find people, organizations, and service providers aligned with community-first outcomes.</p>
        <div className="submissions-list" style={{ marginTop: "1.25rem" }}>
          {directoryEntries.map((entry, idx) => (
            <article className="submission-item" key={idx}>
              <h3 style={{ margin: "0 0 0.5rem" }}>{entry.category}</h3>
              <p style={{ margin: 0 }}>{entry.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
