"use client";

const categories = [
  {
    icon: "⚖️",
    title: "Legal & Advocacy",
    copy: "Rights, records work, and navigating systems with clarity from people who have already walked it.",
  },
  {
    icon: "🎬",
    title: "Media & Storytelling",
    copy: "Documenting culture, sharing community narratives, and teaching the creative work behind visibility.",
  },
  {
    icon: "💼",
    title: "Business & Funding",
    copy: "Real-world guidance on small business, revenue, contracts, and community-centered enterprise.",
  },
  {
    icon: "🔧",
    title: "Trades & Skills",
    copy: "Local craft, service work, and practical know-how that turns experience into dependable income.",
  },
  {
    icon: "🌱",
    title: "Community Leadership",
    copy: "Mentorship, organizing, and the values that keep neighborhoods strong and connected.",
  },
];

const voices = [
  {
    title: "Trusted Legal Guide",
    role: "Community Defense · Chicago",
    summary: "Rights coaching, expungement strategy, and system navigation from a practitioner who centers people over paperwork.",
  },
  {
    title: "Production Mentor",
    role: "Media, Storytelling & Documentation · Atlanta",
    summary: "Creative leadership for people building local narratives, film crews, and community media projects.",
  },
  {
    title: "Funding Coach",
    role: "Business Development · Detroit",
    summary: "Practical steps for accessing grants, managing growth, and building revenue paths that serve your neighborhood.",
  },
  {
    title: "Trade Skills Trainer",
    role: "Construction & Workshops · Oakland",
    summary: "Hands-on skill-sharing across trades, workforce training, and mentorship for people ready to earn from mastery.",
  },
  {
    title: "Community Organizer",
    role: "Leadership & Support · Newark",
    summary: "Experience-based guidance for building local programs, volunteer networks, and trusted civic infrastructure.",
  },
];

export default function VoicesPage() {
  return (
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <div className="homepage-content">
        <section className="homepage-section" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
          <div className="homepage-section-grid homepage-section-grid--split" style={{ gap: "2.5rem" }}>
            <div>
              <p className="homepage-kicker">Real voices</p>
              <h1 className="homepage-section-title">The heart of Community Collective is people sharing knowledge, experience, and leadership.</h1>
              <p className="homepage-section-text">
                This is not a page of influencers. It is a page of practitioners, mentors, tradespeople, organizers, and leaders who share real knowledge, lived experience, and the community work that actually moves people forward.
              </p>
              <div className="homepage-grid-3" style={{ gap: "1rem", marginTop: "1.5rem" }}>
                {categories.map((category) => (
                  <div key={category.title} className="homepage-feature-card">
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{category.icon}</div>
                    <p className="homepage-feature-title">{category.title}</p>
                    <p className="homepage-feature-copy">{category.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="homepage-voice-card" style={{ padding: "2rem", minHeight: "420px", display: "grid", gap: "1.5rem", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top left, rgba(201, 168, 76, 0.12), transparent 20%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <p className="homepage-kicker">Why voices matter</p>
                <h2 className="homepage-section-title" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Knowledge transfers through people, perspective, and trust.
                </h2>
                <p className="homepage-section-text">
                  Community Collective amplifies lived experience, mentorship, and local expertise. Every voice is evidence that your access network is built on real relationships and real practice.
                </p>
              </div>
              <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "1rem" }}>
                <div className="homepage-feature-card">
                  <p className="homepage-feature-title">Real people over influencers</p>
                  <p className="homepage-feature-copy">This page is for trusted professionals, experienced mentors, and community leaders, not polished content creators.</p>
                </div>
                <div className="homepage-feature-card">
                  <p className="homepage-feature-title">Local expertise</p>
                  <p className="homepage-feature-copy">Learn from people who know local systems, pathways, and opportunities in the neighborhoods they serve.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-section homepage-section--dark">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">Voices in action</p>
              <h2 className="homepage-section-title">How knowledge moves here</h2>
            </div>
          </div>
          <div className="homepage-grid-3" style={{ gap: "1rem" }}>
            <div className="homepage-feature-card">
              <p className="homepage-feature-title">Mentorship that lasts</p>
              <p className="homepage-feature-copy">Voices are guides, not broadcasts. They share steps, invite follow-up, and help you make practical progress.</p>
            </div>
            <div className="homepage-feature-card">
              <p className="homepage-feature-title">Perspective from experience</p>
              <p className="homepage-feature-copy">These are people who have worked the jobs, led the projects, and navigated the systems they teach.</p>
            </div>
            <div className="homepage-feature-card">
              <p className="homepage-feature-title">Community-led learning</p>
              <p className="homepage-feature-copy">Every contribution is about building shared infrastructure, not chasing attention.</p>
            </div>
          </div>
        </section>

        <div className="homepage-voice-grid" style={{ marginTop: "2rem" }}>
          {voices.map((voice) => (
            <article key={voice.title} className="homepage-voice-card" style={{ minHeight: "220px" }}>
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
                🗣️
              </div>
              <h3>{voice.title}</h3>
              <p className="homepage-feature-copy" style={{ margin: "0 0 0.75rem 0", color: "#f4cf70", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {voice.role}
              </p>
              <p className="homepage-feature-copy">{voice.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
