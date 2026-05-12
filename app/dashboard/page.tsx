"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { computeProfileCompleted, filterProfilePayload } from "../../lib/profile-fields";
import AuthNavbar from "../components/auth-navbar";

type ProfileData = {
  display_name: string | null;
  username: string | null;
  bio: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  featured_status: string | null;
  is_featured: boolean | null;
  profile_completed: boolean | null;
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [comingSoon, setComingSoon] = useState("");

  useEffect(() => {
    getSupabaseClient().auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const user = data.session.user;
      setEmail(user.email ?? "");

      const { data: profileData } = await (getSupabaseClient().from("profiles") as any)
        .select("display_name,username,bio,description,category,city,state,website,instagram,twitter,linkedin,avatar_url,featured_status,is_featured,profile_completed")
        .eq("id", user.id)
        .maybeSingle();

      const completed = profileData ? computeProfileCompleted(profileData) : false;
      await (getSupabaseClient().from("profiles") as any).upsert(filterProfilePayload({
        id: user.id,
        profile_completed: completed,
        updated_at: new Date().toISOString(),
      }), { onConflict: "id" });

      setProfile(profileData ? { ...profileData, profile_completed: completed } : null);
      document.cookie = "cc-auth=1; Path=/; Max-Age=604800; SameSite=Lax";
    });
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const values = [
      profile.display_name, profile.username, profile.bio, profile.category, profile.city, profile.state,
      profile.website, profile.instagram, profile.twitter, profile.linkedin, profile.description, profile.avatar_url,
    ];
    const done = values.filter((v) => Boolean(v && String(v).trim())).length;
    return Math.round((done / values.length) * 100);
  }, [profile]);

  return (<main className="premium-page"><AuthNavbar /><section className="premium-card dashboard-card">
    <article className="submission-item"><h1 style={{ marginTop: 0 }}>Welcome back</h1><p className="muted">You&apos;re signed in as {email || "member"}.</p></article>
    <article className="submission-item"><h3 style={{ marginTop: 0 }}>Profile completion</h3><p className="muted">{completion}% complete</p><div className="progress-track"><div className="progress-fill" style={{ width: `${completion}%` }} /></div></article>
    <article className="submission-item"><h3 style={{ marginTop: 0 }}>Quick links</h3><div className="quick-links"><Link className="gold-link" href="/onboarding">Complete Profile</Link><Link className="gold-link" href="/directory">Browse Directory</Link><Link className="gold-link" href="/opportunities">View Opportunities</Link><Link className="gold-link" href="/apply">Apply to be Featured</Link><Link className="gold-link" href="/profile">View Public Profile</Link></div></article>
    <div className="dashboard-grid">
      <article className="submission-item"><h3 style={{ marginTop: 0 }}>Your Feed</h3><p className="muted">No feed items yet. Member/media posts are launching soon.</p><button className="gold-link" type="button" onClick={() => setComingSoon("Create Post is coming soon.")}>Create Post (Coming Soon)</button></article>
      <article className="submission-item"><h3 style={{ marginTop: 0 }}>Featured members</h3><p className="muted">Featured status: {profile?.featured_status || (profile?.is_featured ? "featured" : "none")}.</p><button className="gold-link" type="button" onClick={() => setComingSoon("Featured submissions are coming soon.")}>Featured Submissions (Coming Soon)</button></article>
      <article className="submission-item"><h3 style={{ marginTop: 0 }}>Opportunities preview</h3><ul className="muted" style={{paddingLeft:"1rem", margin:"0.25rem 0"}}><li>Casting + Audition Calls</li><li>Jobs + Internships</li><li>Funding + Grants</li></ul><Link className="gold-link" href="/opportunities">Open full opportunities</Link></article>
    </div>
    {comingSoon ? <p className="muted">{comingSoon}</p> : null}
  </section></main>);
}
