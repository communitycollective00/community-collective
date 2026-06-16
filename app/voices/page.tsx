"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

const categories = [
  { icon: "⚖️", title: "Legal & Advocacy", copy: "Rights, records work, and navigating systems with clarity from people who have already walked it." },
  { icon: "🎬", title: "Media & Storytelling", copy: "Documenting culture, sharing community narratives, and teaching the creative work behind visibility." },
  { icon: "💼", title: "Business & Funding", copy: "Real-world guidance on small business, revenue, contracts, and community-centered enterprise." },
  { icon: "🔧", title: "Trades & Skills", copy: "Local craft, service work, and practical know-how that turns experience into dependable income." },
  { icon: "🌱", title: "Community Leadership", copy: "Mentorship, organizing, and the values that keep neighborhoods strong and connected." },
];

const whyCards = [
  { label: "Real people over influencers", copy: "This page is for trusted professionals, experienced mentors, and community leaders, not polished content creators." },
  { label: "Local expertise", copy: "Learn from people who know local systems, pathways, and opportunities in the neighborhoods they serve." },
];

const howCards = [
  { label: "Mentorship that lasts", copy: "Voices are guides, not broadcasts. They share steps, invite follow-up, and help you make practical progress." },
  { label: "Perspective from experience", copy: "These are people who have worked the jobs, led the projects, and navigated the systems they teach." },
  { label: "Community-led learning", copy: "Every contribution is about building shared infrastructure, not chasing attention." },
];

const placeholderVoices = [
  { title: "Trusted Legal Guide", role: "COMMUNITY DEFENSE · CHICAGO", copy: "Rights coaching, expungement strategy, and system navigation from a practitioner who centers people over paperwork." },
  { title: "Production Mentor", role: "MEDIA, STORYTELLING & DOCUMENTATION · ATLANTA", copy: "Creative leadership for people building local narratives, film crews, and community media projects." },
  { title: "Funding Coach", role: "BUSINESS DEVELOPMENT · DETROIT", copy: "Practical steps for accessing grants, managing growth, and building revenue paths that serve your neighborhood." },
  { title: "Trade Skills Trainer", role: "CONSTRUCTION & WORKSHOPS · OAKLAND", copy: "Hands-on skill-sharing across trades, workforce training, and mentorship for people ready to earn from mastery." },
  { title: "Community Organizer", role: "LEADERSHIP & SUPPORT · NEWARK", copy: "Experience-based guidance for building local programs, volunteer networks, and trusted civic infrastructure." },
];

interface Interview {
  id: string;
  title: string;
  interview_guest_name: string | null;
  interview_guest_title: string | null;
  interview_guest_organization: string | null;
  interview_cover_url: string | null;
  interview_summary: string | null;
}

export default function VoicesPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pageBg, setPageBg] = useState<string>("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();

      // Fetch background + interviews in parallel
      const [bgRes, interviewRes] = await Promise.all([
        (supabase.from("page_backgrounds") as any).select("*").eq("page_key", "voices").limit(1),
        (supabase.from("posts") as any)
          .select("id, title, interview_guest_name, interview_guest_title, interview_guest_organization, interview_cover_url, interview_summary")
          .eq("post_type", "interview")
          .eq("is_published", true)
          .order("created_at", { ascending: false }),
      ]);

      const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
      if (bgRow?.image_url) setPageBg(bgRow.image_url);

      setInterviews(interviewRes.data || []);
      setLoaded(true);
    }
    load();
  }, []);

  const bgStyle = pageBg
    ? { backgroundImage: `url(${pageBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundAttachment: "fixed" }
    : {};

  return (
    <main className="premium-page" style={{ paddingTop: 92, ...bgStyle }}>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem 2rem" }}>
        <p className="hp-eyebrow">NEIGHBORHOOD HEROES</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "2rem", color: "var(--gold)" }}>
          THE HEART OF COMMUNITY COLLECTIVE IS PEOPLE SHARING KNOWLEDGE, EXPERIENCE, AND LEADERSHIP.
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gold2)", marginBottom: "0.5rem" }}>WHY THIS MATTERS</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text)", marginBottom: "1rem" }}>KNOWLEDGE TRANSFERS THROUGH PEOPLE, PERSPECTIVE, AND TRUST.</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>Community Collective amplifies lived experience, mentorship, and local expertise. Every voice is evidence that your access network is built on real relationships and real practice.</p>
            {whyCards.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ color: "var(--gold)", fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap" }}>{c.label}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{c.copy}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {categories.map((cat, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{cat.icon}</div>
                <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem", marginBottom: "0.4rem" }}>{cat.title}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>{cat.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hp-divider" />

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <p className="hp-eyebrow">VOICES IN ACTION</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "var(--text)", marginBottom: "1.5rem" }}>HOW KNOWLEDGE MOVES HERE</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {howCards.map((c, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
              <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>{c.label}</p>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{c.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="hp-divider" />

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        <p className="hp-eyebrow">INTERVIEWS</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "var(--text)", marginBottom: "1.5rem" }}>REAL CONVERSATIONS</h2>

        {!loaded ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : interviews.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {placeholderVoices.map((v, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface-soft)", border: "2px solid var(--border)", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🎙</div>
                <h3 style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem" }}>{v.title}</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--gold2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{v.role}</p>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{v.copy}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {interviews.map((iv) => {
              const name = iv.interview_guest_name ?? iv.title ?? "Untitled";
              const snippet = iv.interview_summary ? iv.interview_summary.slice(0, 120) + (iv.interview_summary.length > 120 ? "..." : "") : "";
              return (
                <Link key={iv.id} href={`/posts/${iv.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ position: "relative", paddingTop: "60%", background: "var(--surface-soft)" }}>
                      {iv.interview_cover_url
                        ? <img src={iv.interview_cover_url} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", color: "var(--muted)" }}>🎙</div>
                      }
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "0.4rem" }}>Interview</p>
                      <h3 style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem", fontSize: "1rem" }}>{name}</h3>
                      {(iv.interview_guest_title || iv.interview_guest_organization) && (
                        <p style={{ fontSize: "0.8rem", color: "var(--gold2)", marginBottom: "0.6rem" }}>
                          {[iv.interview_guest_title, iv.interview_guest_organization].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {snippet && <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{snippet}</p>}
                      <p style={{ color: "var(--gold)", fontSize: "0.8rem", marginTop: "0.75rem" }}>Read interview →</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}