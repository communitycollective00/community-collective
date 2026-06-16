"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

interface Interview {
  id: string;
  title: string;
  interview_guest_name: string | null;
  interview_guest_title: string | null;
  interview_guest_organization: string | null;
  interview_cover_url: string | null;
  interview_summary: string | null;
  created_at: string;
}

export default function VoicesPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();
      const { data } = await (supabase.from("posts") as any)
        .select("id, title, interview_guest_name, interview_guest_title, interview_guest_organization, interview_cover_url, interview_summary, created_at")
        .eq("post_type", "interview")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setInterviews(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", paddingTop: "92px" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem 1.5rem" }}>
        <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted)", marginBottom: "0.75rem" }}>
          Neighborhood Heroes
        </p>
        <h1 style={{ fontSize: "3rem", fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "0.75rem" }}>
          Voices
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, fontSize: "1rem", marginBottom: "3rem" }}>
          Real conversations with the people shaping communities from the inside out.
        </p>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : interviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--muted)" }}>
            <p style={{ fontSize: "1.1rem" }}>No interviews published yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {interviews.map((interview) => {
              const name = interview.interview_guest_name ?? interview.title ?? "Untitled";
              const snippet = interview.interview_summary
                ? interview.interview_summary.slice(0, 120) + (interview.interview_summary.length > 120 ? "…" : "")
                : null;
              return (
                <Link key={interview.id} href={`/posts/${interview.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ position: "relative", width: "100%", paddingTop: "75%", background: "var(--surface-soft)" }}>
                      {interview.interview_cover_url ? (
                        <img src={interview.interview_cover_url} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: 700, color: "var(--muted)" }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "1.25rem" }}>
                      <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: "0.5rem" }}>Interview</p>
                      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem", lineHeight: 1.3 }}>{name}</h2>
                      {(interview.interview_guest_title || interview.interview_guest_organization) && (
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                          {[interview.interview_guest_title, interview.interview_guest_organization].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {snippet && <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>{snippet}</p>}
                      <p style={{ fontSize: "0.8rem", color: "var(--gold)", marginTop: "1rem" }}>Read interview →</p>
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
