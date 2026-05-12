"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { fallbackAvatar, filterProfilePayload } from "../../lib/profile-fields";
import AuthNavbar from "../components/auth-navbar";

type ProfileData = {
  full_name: string | null;
  username: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  website: string | null;
  instagram: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  services_offered: string | null;
  social_links: string | null;
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    getSupabaseClient().auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const user = data.session.user;
      setEmail(user.email ?? "");

      await (getSupabaseClient().from("profiles") as any).upsert(filterProfilePayload({
        id: user.id,
        updated_at: new Date().toISOString(),
      }), { onConflict: "id" });

      const { data: profileData } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,bio,city,state,industry,website,instagram,linkedin,avatar_url,services_offered,social_links")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData ?? null);
      document.cookie = "cc-auth=1; Path=/; Max-Age=604800; SameSite=Lax";
    });
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;
    let socialLinks = {} as Record<string, string>;
    if (profile.social_links) {
      try { socialLinks = JSON.parse(profile.social_links); } catch { socialLinks = {}; }
    }
    const values = [
      profile.full_name, profile.username, profile.bio, profile.industry, profile.city, profile.state,
      profile.website, profile.instagram, socialLinks.tiktok, socialLinks.youtube, profile.linkedin, profile.services_offered,
    ];
    const done = values.filter((v) => Boolean(v && String(v).trim())).length;
    return Math.round((done / values.length) * 100);
  }, [profile]);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card">
        <article className="submission-item">
          <h1 style={{ marginTop: 0 }}>Welcome back</h1>
          <p className="muted">You&apos;re signed in as {email || "member"}.</p>
        </article>

        <article className="submission-item">
          <h3 style={{ marginTop: 0 }}>Profile completion</h3>
          <p className="muted">{completion}% complete</p>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
        </article>

        <article className="submission-item">
          <h3 style={{ marginTop: 0 }}>Quick links</h3>
          <div className="quick-links">
            <Link className="gold-link" href="/onboarding">Complete Profile</Link>
            <Link className="gold-link" href="/directory">Browse Directory</Link>
            <Link className="gold-link" href="/opportunities">View Opportunities</Link>
            <Link className="gold-link" href="/apply">Apply to be Featured</Link>
          </div>
        </article>

        <div className="dashboard-grid">
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Your Feed</h3>
            <p className="muted">Feed placeholder: updates from members, events, and opportunities will appear here.</p>
          </article>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Featured members</h3>
            <p className="muted">Featured status: {profile?.username ? "Active member" : "Profile not completed"}.</p>
          </article>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Opportunities preview</h3>
            <ul className="muted" style={{paddingLeft:"1rem", margin:"0.25rem 0"}}><li>Casting + Audition Calls</li><li>Jobs + Internships</li><li>Funding + Grants</li></ul><Link className="gold-link" href="/opportunities">Open full opportunities</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
