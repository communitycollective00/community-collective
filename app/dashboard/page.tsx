"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";
import { isProfessionalRole } from "../../lib/roles";

type ProfileData = {
  full_name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
};

type PostData = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  created_at: string | null;
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const sessionResult = await getSupabaseClient().auth.getSession();
      const session = sessionResult.data?.session;

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const user = session.user;
      setEmail(user.email ?? "");

      const { data: profileData } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,email,role")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(profileData || null);
      document.cookie = "cc-auth=1; Path=/; Max-Age=604800; SameSite=Lax";

      const { data: postsData } = await (getSupabaseClient().from("posts") as any)
        .select("id,title,body,post_type,created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setPosts(postsData || []);
    };

    load();
    // If redirected from admin guard, show a clear message.
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin_required")) {
        setStatus("Admin access required.");
      }
    } catch (e) {}
  }, []);

  const isProfessional = isProfessionalRole(profile?.role);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card dashboard-card">
        <article className="submission-item">
          <h1 style={{ marginTop: 0 }}>Welcome back</h1>
          <p className="muted">Signed in as {profile?.full_name || email || "member"}.</p>
          <p className="muted">Role: {profile?.role || "public"}</p>
        </article>

        <article className="submission-item">
          <h3 style={{ marginTop: 0 }}>{isProfessional ? "Professional dashboard" : "Member home"}</h3>
          <p className="muted">{isProfessional ? "Manage your profile, posts, and opportunities in one trusted place." : "Browse verified professionals, discover opportunities, and apply to become a featured professional."}</p>
        </article>

        <article className="submission-item">
          <h3 style={{ marginTop: 0 }}>Quick actions</h3>
          <div className="quick-links">
            {isProfessional ? <Link className="gold-link" href="/posts/create">Create post</Link> : null}
            <Link className="gold-link" href="/profile">Edit Profile</Link>
            <Link className="gold-link" href="/directory">Browse Directory</Link>
            <Link className="gold-link" href="/opportunities">View Opportunities</Link>
            <Link className="gold-link" href="/apply">Apply to be featured</Link>
          </div>
        </article>

        <div className="dashboard-grid">
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Latest posts</h3>
            {posts.length === 0 ? (
              <p className="muted">No published posts yet.</p>
            ) : (
              <div className="submissions-list">
                {posts.map((post) => (
                  <article key={post.id} className="submission-item" style={{ padding: "0.75rem" }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{post.title || "Untitled post"}</p>
                    <p className="muted">{post.post_type || "Update"}</p>
                    <p className="muted" style={{ margin: 0 }}>{post.body?.slice(0, 100) || "Shared media content."}</p>
                  </article>
                ))}
              </div>
            )}
          </article>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Opportunity essentials</h3>
            <ul className="muted" style={{ paddingLeft: "1rem", margin: "0.25rem 0" }}>
              <li>Jobs + internships</li>
              <li>Mentorships + coaching</li>
              <li>Events + learning</li>
            </ul>
            <Link className="gold-link" href="/opportunities">Open opportunities</Link>
          </article>
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Trust signals</h3>
            <p className="muted">Verified professionals can be surfaced, reviewed, and trusted. Public members browse without posting public profiles.</p>
          </article>
        </div>

        {status ? <p className="muted">{status}</p> : null}
      </section>
    </main>
  );
}
