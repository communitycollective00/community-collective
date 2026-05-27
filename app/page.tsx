"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section style={{ padding: "6rem 1.5rem 4rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: "2rem" }}>
          <div style={{ display: "grid", gap: "1.5rem", maxWidth: 760 }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.25em", color: "#d3c18e", fontSize: "0.85rem", fontWeight: 800 }}>
              Community Collective
            </span>
            <h1 style={{ fontSize: "clamp(3rem, 6vw, 5rem)", lineHeight: 1.02, margin: 0, color: "#f4e8c1" }}>
              REAL PEOPLE. REAL KNOWLEDGE. REAL ACCESS.
            </h1>
            <p style={{ color: "#d3c18e", fontSize: "1rem", lineHeight: 1.8, maxWidth: 600 }}>
              A trusted ecosystem where professionals, creatives, and communities connect around verified knowledge, meaningful opportunities, and shared access.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Link href="/voices" className="gold-btn">
                Explore Voices
              </Link>
              <Link href="/opportunities" className="gold-btn">
                View Opportunities
              </Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Selected Voices", value: "Featured professionals and real community expertise." },
              { label: "Open Opportunities", value: "Jobs, internships, auditions, and grant listings." },
              { label: "Community Access", value: "Resources, directory listings, and trusted pathways." },
            ].map((item) => (
              <div key={item.label} className="premium-card" style={{ padding: "1.5rem", borderRadius: 16, background: "#0c0a08" }}>
                <p style={{ margin: "0 0 0.75rem", color: "#f4cf70", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {item.label}
                </p>
                <p style={{ margin: 0, color: "#d3c18e" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
