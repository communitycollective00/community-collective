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
  }, []);

  const isProfessional = isProfessionalRole(profile?.role ?? role);

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <article className="submission-item">
            <h1 style={{ marginTop: 0 }}>Welcome back</h1>
            <p className="muted">Signed in as {profile?.full_name || email || "member"}.</p>
            <p className="muted">Role: {authLoading ? "loading..." : authError ? authError : profile ? profile.role ?? "unknown" : "Profile not found for this user."}</p>
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
