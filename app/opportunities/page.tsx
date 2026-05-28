"use client";

import Link from "next/link";

const opportunities = [
  { title: "Jobs + Internships", category: "Career", detail: "Paid roles, apprenticeships, and entry-level growth pathways from verified organizations.", color: "gold" },
  { title: "Mentorships + Coaching", category: "Development", detail: "Guided learning, mentoring sessions, and career support from trusted professionals.", color: "blue" },
  { title: "Events + Workshops", category: "Experience", detail: "Live sessions, panels, and resource-driven events that connect people to the right room.", color: "green" },
  { title: "Auditions + Casting Calls", category: "Creative", detail: "Auditions, talent calls, and studio opportunities shared by industry experts.", color: "gold" },
  { title: "Grants + Funding", category: "Capital", detail: "Non-dilutive grants, sponsorships, and supported funding opportunities for growing professionals.", color: "green" },
  { title: "Educational Resources", category: "Learning", detail: "Courses, guides, and resource libraries built to help users translate access into outcomes.", color: "blue" },
];

const colorMap: { [key: string]: string } = {
  gold: "#C9A84C",
  blue: "#4A9FD4",
  green: "#3DBE8A",
};

export default function OpportunitiesPage() {
  return (
    <main style={{ background: "linear-gradient(180deg, #0b0702 0%, #040303 60%)", color: "#F0EDE6", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ paddingTop: "120px", paddingBottom: "88px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "flex-start", marginBottom: "52px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "12px" }}>Opportunities</div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 4vw, 64px)", lineHeight: 0.93, letterSpacing: "0.04em", margin: 0, color: "#F0EDE6", marginBottom: "24px" }}>Your Next Move<br />Is Right Here.</h1>
              <p style={{ color: "#888", fontSize: "15px", lineHeight: 1.8, maxWidth: "560px" }}>Casting calls, auditions, internships, grants, apprenticeships, collaborations, brand partnerships, job openings — real opportunities from real organizations. Updated regularly.</p>
            </div>
            <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "4px", padding: "28px" }}>
              <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "14px" }}>Post an Opportunity</div>
              <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.7, marginBottom: "20px" }}>Organizations and members can post casting calls, jobs, gigs, grants, auditions, apprenticeships, and more. Reviewed before going live.</p>
              <Link href="/get-access" style={{ display: "inline-block", background: "none", border: "1px solid #222", color: "#F0EDE6", borderRadius: "3px", padding: "9px 18px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s", textDecoration: "none" }}>Submit an Opportunity →</Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {opportunities.length === 0 ? (
              <article style={{ background: "#141414", border: "1px solid #222", borderRadius: "4px", padding: "28px" }}>
                <h3>No opportunities posted yet</h3>
                <p style={{ color: "#888" }}>Check back soon.</p>
              </article>
            ) : (
              opportunities.map((opportunity, idx) => {
                const borderColor = colorMap[opportunity.color] || "#C9A84C";
                const slug = opportunity.title.replace(/[\s+\\/+,&]+/g, "-").toLowerCase();
                return (
                  <Link key={idx} href={`/opportunities?filter=${encodeURIComponent(slug)}`} style={{ background: "#141414", border: "1px solid #222", borderLeft: `4px solid ${borderColor}`, borderRadius: "4px", padding: "26px", transition: "all 0.2s", textDecoration: "none", color: "inherit", display: "block", cursor: "pointer" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 700, color: "#F0EDE6" }}>{opportunity.title}</h3>
                    <p style={{ margin: "0 0 12px 0", fontSize: "10px", color: borderColor, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{opportunity.category}</p>
                    <p style={{ margin: 0, color: "#888", fontSize: "13px", lineHeight: 1.7 }}>{opportunity.detail}</p>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
