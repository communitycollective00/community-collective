"use client";

const voices = [
  { name: "Featured Voice", role: "Legal + Advocacy", summary: "Guidance on rights, paperwork, and how to move smart through high-pressure situations." },
  { name: "Featured Voice", role: "Business + Funding", summary: "Practical strategy for pricing, negotiations, and building sustainable income channels." },
  { name: "Featured Voice", role: "Creative + Media", summary: "Industry perspective on publishing, visibility, and protecting your creative ownership." },
];

export default function VoicesPage() {
  return (
    <main style={{ background: "linear-gradient(180deg, #0b0702 0%, #040303 60%)", color: "#F0EDE6", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ paddingTop: "120px", paddingBottom: "88px" }}>
          <div style={{ marginBottom: "52px" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "12px" }}>Featured Voices</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 4vw, 64px)", lineHeight: 0.93, letterSpacing: "0.04em", margin: 0, color: "#F0EDE6", marginBottom: "24px" }}>Selected.<br />Verified. For Real.</h1>
            <p style={{ color: "#888", fontSize: "15px", lineHeight: 1.8, maxWidth: "560px" }}>Not influencers. Not fake gurus. Real professionals from every field — selected because they actually give back. Free knowledge. No gatekeeping.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {voices.map((voice, idx) => (
              <article key={idx} style={{ background: "#141414", border: "1px solid #222", borderRadius: "4px", padding: "28px", transition: "all 0.25s", position: "relative", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ content: "''", position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #C9A84C, #E8C96A)" }}></div>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(201, 168, 76, 0.08)", border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", marginBottom: "18px" }}>👤</div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#F0EDE6" }}>{voice.name}</h3>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#C9A84C", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{voice.role}</p>
                <p style={{ margin: 0, color: "#888", fontSize: "13px", lineHeight: 1.7 }}>{voice.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
