import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press",
  description: "Media inquiries, press credentials, and coverage information for Culture Collective.",
};

const COVERAGE = [
  { area: "Sports & Athletics", detail: "Chicago Bears · Bulls · White Sox · Cubs · Indiana Pacers · Colts" },
  { area: "Music & Entertainment", detail: "Live events, festivals, artist profiles, cultural moments" },
  { area: "Culture & Community", detail: "Organizations, leaders, neighborhood stories, civic voices" },
  { area: "Photojournalism & Documentary", detail: "On-the-ground visual storytelling and long-form coverage" },
  { area: "Access & Opportunity", detail: "Resources, grants, mentorship, scholarships, and local openings" },
];

export default function PressPage() {
  return (
    <main style={{ paddingTop: "96px", paddingBottom: "80px", maxWidth: "820px", margin: "0 auto", padding: "96px 1.5rem 80px" }}>

      <p style={{ fontSize: "0.67rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "1rem", marginTop: 0 }}>◆ Media & Press</p>

      <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.8rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#fff", marginBottom: "1.2rem", marginTop: 0 }}>
        Culture Collective<br />
        <span style={{ color: "#F5D97A" }}>Press Room</span>
      </h1>

      <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.8, maxWidth: "580px", marginBottom: "2.5rem" }}>
        A Chicago and Indianapolis-based media platform covering sports, culture, community, and access — documenting the people, events, and opportunities that define modern urban life.
      </p>

      <div style={{ height: "1px", background: "linear-gradient(90deg, #C9A84C, transparent)", marginBottom: "3rem" }} />

      <section style={{ marginBottom: "3.5rem" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "1rem" }}>About the Platform</p>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.9, marginBottom: "1rem" }}>
          Founded in 2026, Culture Collective is a digital media platform built to document and amplify the voices, events, and opportunities that shape cultural life across Chicago, Indianapolis, and the broader Midwest. We operate at the intersection of sports access, community journalism, and opportunity infrastructure.
        </p>
        <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.9 }}>
          Our editorial approach combines on-the-ground photojournalism, long-form interviews, live event coverage, and a curated opportunity network — giving our audience direct access to the people and resources that matter most in their communities.
        </p>
      </section>

      <section style={{ marginBottom: "3.5rem" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "1.5rem" }}>Coverage Areas</p>
        <div>
          {COVERAGE.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "1.2rem", padding: "1rem 0", borderBottom: "1px solid rgba(201,168,76,0.1)", alignItems: "flex-start" }}>
              <span style={{ color: "#C9A84C", fontSize: "0.5rem", marginTop: "0.4rem", flexShrink: 0 }}>◆</span>
              <div>
                <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", marginBottom: "3px", marginTop: 0 }}>{c.area}</p>
                <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.8rem", margin: 0 }}>{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="cc-stats-strip" style={{ marginBottom: "3.5rem" }}>
        <div className="cc-stat"><span className="cc-stat-num">2026</span><span className="cc-stat-lbl">Founded</span></div>
        <div className="cc-stat"><span className="cc-stat-num">2</span><span className="cc-stat-lbl">Markets</span></div>
        <div className="cc-stat"><span className="cc-stat-num">Digital</span><span className="cc-stat-lbl">Format</span></div>
        <div className="cc-stat"><span className="cc-stat-num">Open</span><span className="cc-stat-lbl">Access</span></div>
      </div>

      <section style={{ marginBottom: "3.5rem" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "1.5rem" }}>Masthead</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 0", borderBottom: "1px solid rgba(201,168,76,0.1)", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", margin: 0 }}>Dennis Pugh</p>
            <p style={{ color: "#C9A84C", fontSize: "0.75rem", letterSpacing: "0.05em", margin: "3px 0 0" }}>Founder & Editor-in-Chief</p>
          </div>
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.78rem", margin: 0 }}>Chicago · Indianapolis</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 0", borderBottom: "1px solid rgba(201,168,76,0.1)", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem", margin: 0 }}>Contributing Editors</p>
            <p style={{ color: "#C9A84C", fontSize: "0.75rem", letterSpacing: "0.05em", margin: "3px 0 0" }}>Staff Writers & Photojournalists</p>
          </div>
          <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.78rem", margin: 0 }}>Midwest</p>
        </div>
      </section>

      <section style={{ padding: "2rem", border: "1px solid rgba(201,168,76,0.16)", background: "rgba(201,168,76,0.04)", marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.8rem" }}>Press Contact</p>
        <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", marginTop: 0 }}>Credential & Media Inquiries</p>
        <p style={{ color: "rgba(255,255,255,0.42)", fontSize: "0.88rem", lineHeight: 1.8, marginBottom: "1.4rem" }}>
          For press credentials, sideline access, event media passes, coverage partnerships, and interview inquiries. All credentialing requests receive a response within 24 hours.
        </p>
        <a href="mailto:press@culturecollective.com" style={{ display: "inline-block", padding: "0.7rem 1.5rem", background: "#C9A84C", color: "#0a0908", fontWeight: 700, fontSize: "0.74rem", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
          press@culturecollective.com
        </a>
      </section>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ fontSize: "0.78rem", color: "#C9A84C", letterSpacing: "0.06em", textDecoration: "none" }}>← Back to Culture Collective</Link>
        <Link href="/voices" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", textDecoration: "none" }}>View Coverage →</Link>
      </div>

    </main>
  );
}
