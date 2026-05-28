"use client";

const voices = [
  { name: "Featured Voice", role: "Legal + Advocacy", summary: "Guidance on rights, paperwork, and how to move smart through high-pressure situations." },
  { name: "Featured Voice", role: "Business + Funding", summary: "Practical strategy for pricing, negotiations, and building sustainable income channels." },
  { name: "Featured Voice", role: "Creative + Media", summary: "Industry perspective on publishing, visibility, and protecting your creative ownership." },
];

export default function VoicesPage() {
  return (
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <div className="homepage-content">
        <section className="homepage-section" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div>
            <p className="homepage-kicker">Featured Voices</p>
            <h1 className="homepage-section-title">Selected. Verified. For real.</h1>
            <p className="homepage-section-text">
              Not influencers. Not fake gurus. Real professionals from every field — selected because they actually give back. Free knowledge. No gatekeeping.
            </p>
          </div>

          <div className="homepage-voice-grid">
            {voices.map((voice, idx) => (
              <article key={idx} className="homepage-voice-card">
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #C9A84C, #E8C96A)",
                  }}
                />
                <div className="homepage-voice-avatar" style={{ borderRadius: "50%", width: "60px", height: "60px", display: "grid", placeItems: "center", fontSize: "28px", marginBottom: "18px", border: "2px solid rgba(201, 168, 76, 0.18)", background: "rgba(201, 168, 76, 0.08)" }}>
                  👤
                </div>
                <h3>{voice.name}</h3>
                <p className="homepage-feature-copy" style={{ margin: "0 0 1rem 0", color: "#f4cf70", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {voice.role}
                </p>
                <p className="homepage-feature-copy">{voice.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
