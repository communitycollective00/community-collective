"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
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

      await (getSupabaseClient().from("profiles") as any).upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const { data: profileData } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,bio,city,state,industry,website,instagram,linkedin,avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData ?? null);
      document.cookie = "cc-auth=1; Path=/; Max-Age=604800; SameSite=Lax";
    });
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;

    const values = [profile.full_name, profile.username, profile.bio, profile.city, profile.state, profile.industry, profile.website, profile.instagram, profile.linkedin, profile.avatar_url];
    const done = values.filter((value) => Boolean(value && String(value).trim())).length;
    return Math.round((done / values.length) * 100);
  }, [profile]);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome back {email || "member"}.</p>
        <p className="muted">Logged in as: {email || "-"}</p>

        <article className="submission-item">
          <h3 style={{ marginTop: 0 }}>Profile completion</h3>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>{completion}% complete</p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
        </article>

        <div className="quick-links">
          <Link className="gold-link" href="/profile">Profile</Link>
          <Link className="gold-link" href="/get-access">Get Access</Link>
          <Link className="gold-link" href="/">Opportunities</Link>
          <Link className="gold-link" href="/admin/submissions">Submissions</Link>
        </div>
      </section>
    </main>
  );
}
