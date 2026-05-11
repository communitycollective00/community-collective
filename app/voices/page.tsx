import AuthNavbar from "../components/auth-navbar";

const voices = [
  { name: "Featured Voice", role: "Legal + Advocacy", summary: "Guidance on rights, paperwork, and how to move smart through high-pressure situations." },
  { name: "Featured Voice", role: "Business + Funding", summary: "Practical strategy for pricing, negotiations, and building sustainable income channels." },
  { name: "Featured Voice", role: "Creative + Media", summary: "Industry perspective on publishing, visibility, and protecting your creative ownership." },
];

export default function VoicesPage() {
  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Community Collective</p>
        <h1 style={{ marginTop: 8 }}>Voices</h1>
        <p className="muted">Selected community experts sharing real game, lived knowledge, and practical next steps.</p>
        <div className="submissions-list" style={{ marginTop: "1.25rem" }}>
          {voices.map((voice, idx) => (
            <article className="submission-item" key={idx}>
              <h3 style={{ margin: "0 0 0.25rem" }}>{voice.name}</h3>
              <p className="muted" style={{ margin: "0 0 0.5rem" }}>{voice.role}</p>
              <p style={{ margin: 0 }}>{voice.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
