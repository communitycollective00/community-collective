"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isProfessionalRole } from "../../lib/roles";
import { useAuth } from "../components/auth-provider";

type ProfileData = {
  id: string | null;
  full_name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
};

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/\+^])/g, "\\$1") + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}


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
  const [profileLoading, setProfileLoading] = useState(true);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [status, setStatus] = useState("");

  const { user, profile: providerProfile, role, loading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    const load = async () => {

      try {






        if (authLoading) return;
        if (!user) {
          window.location.href = "/login";
          return;
        }

        setEmail(user.email ?? "");
        setProfile((providerProfile as any) || null);
        setProfileLoading(false);

        // fetch recent posts (still OK to fetch here)
        try {
          const supabase = (await import("../../lib/supabase")).getSupabaseClient();
          const { data: postsData } = await (supabase.from("posts") as any)
            .select("id,title,body,post_type,created_at")
            .eq("author_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);
          setPosts(postsData || []);
        } catch (e) {
          console.error("[Dashboard] posts fetch failed", e);
        }
      } catch (err) {
        console.error("[Dashboard] load failed", err);
      }
    };

    load();
    // If redirected from admin guard, show a clear message.
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin_required")) {
        setStatus("Admin access required.");
      }
    } catch (e) {}
  }, [user, authLoading]);

  const isProfessional = isProfessionalRole(profile?.role ?? role);

  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
        <div className="dashboard-hero">
          <h1 style={{ margin: 0 }}>Welcome back, {profile?.full_name || email || "member"}</h1>
          <p className="homepage-section-text" style={{ margin: "0.8rem 0 0" }}>
            {isProfessional
              ? "This is your premium hub for profile edits, posts, and community updates."
              : "Browse verified professionals, update your public details, and find the access you need."}
          </p>
          <p className="muted" style={{ margin: "0.8rem 0 0", fontStyle: "italic" }}>
            Dashboard is your personal member control center. Admin command center access is separate and available at /admin for approved staff.
          </p>
          <div className="page-actions">
            {isProfessional ? <Link className="gold-btn" href="/posts/create">Create post</Link> : null}
            <Link className="gold-btn" href="/profile">Edit Profile</Link>
            <Link className="gold-btn" href="/directory">Browse Directory</Link>
            <Link className="gold-btn" href="/opportunities">View Opportunities</Link>
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Your status</h3>
            <p className="muted">Signed in as {profile?.full_name || email || "member"}.</p>
            {authLoading ? (
              <p className="muted">Loading your profile...</p>
            ) : authError ? (
              <div>
                <p className="muted" style={{ color: "#d97706", marginBottom: "0.5rem" }}>⚠ {authError}</p>
                {authError.toLowerCase().includes("profile not found") && (
                  <p className="muted">Your account is ready! Complete your profile to unlock directory visibility and premium features.</p>
                )}
              </div>
            ) : profile ? (
              <p className="muted">Role: {profile.role ?? "community member"}</p>
            ) : (
              <p className="muted">Role: Setting up your profile...</p>
            )}
          </article>

          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Recent posts</h3>
            {posts.length === 0 ? (
              <p className="muted">No published posts yet.</p>
            ) : (
              <div className="submissions-list">
                {posts.map((post) => (
                  <article key={post.id} className="post-card">
                    <p style={{ margin: 0, fontWeight: 700 }}>{post.title || "Untitled post"}</p>
                    <p className="muted" style={{ margin: "0.25rem 0" }}>{post.post_type || "Update"}</p>
                    <p className="muted" style={{ margin: 0 }}>{post.body?.slice(0, 110) || "Shared media content."}</p>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="submission-item">
            <h3 style={{ marginTop: 0 }}>Member essentials</h3>
            <ul className="muted" style={{ paddingLeft: "1rem", margin: "0.25rem 0" }}>
              <li>Public directory exposure</li>
              <li>Verified creator posting</li>
              <li>Opportunity discovery</li>
            </ul>
            <Link className="gold-link" href="/apply">Apply to be featured</Link>
          </article>
        </div>

        {status ? <p className="muted page-note">{status}</p> : null}
      </section>
    </main>
  );
}
