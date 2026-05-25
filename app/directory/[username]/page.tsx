"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthNavbar from "../../components/auth-navbar";
import { getSupabaseClient } from "../../../lib/supabase";
import { fallbackAvatar } from "../../../lib/profile-fields";
import { isProfessionalRole } from "../../../lib/roles";

type PublicProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  bio: string | null;
  description: string | null;
  category: string | null;
  industry: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  role: string | null;
  is_featured: boolean | null;
  created_at: string | null;
};

type ProfilePost = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  media_url: string | null;
  link_url: string | null;
  created_at: string | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);

  useEffect(() => {
    if (!username) return;

    (async () => {
      const { data } = await (getSupabaseClient().from("profiles") as any)
        .select("id,full_name,email,username,bio,description,category,industry,location,city,state,website,instagram,tiktok,youtube,twitter,linkedin,avatar_url,role,is_featured,created_at")
        .eq("username", username)
        .maybeSingle();

      setProfile(data ?? null);
      if (data?.id) {
        const { data: postsData } = await (getSupabaseClient().from("posts") as any)
          .select("id,title,body,post_type,media_url,link_url,created_at")
          .eq("author_id", data.id)
          .order("created_at", { ascending: false })
          .limit(5);
        setPosts(postsData ?? []);
      }
    })();
  }, [username]);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        {!profile ? (
          <p>User not found.</p>
        ) : (
          <>
            <img src={profile.avatar_url || fallbackAvatar(profile.full_name || profile.username)} alt="Profile avatar" className="profile-avatar" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0 }}>{profile.full_name || profile.username}</h1>
              {isProfessionalRole(profile.role) ? <span className="verify-badge">Verified professional</span> : <span className="verify-badge">Member profile</span>}
            </div>
            <p className="muted">@{profile.username}</p>
            <p>{profile.bio || profile.description || "No bio yet."}</p>
            <p><strong>Expertise:</strong> {profile.category || profile.industry || "General"}</p>
            <p><strong>Location:</strong> {profile.location || [profile.city, profile.state].filter(Boolean).join(", ") || "Unknown"}</p>
            <p><strong>Website:</strong> {profile.website ? <a className="gold-link" href={profile.website} target="_blank">Visit</a> : "None"}</p>
            <p className="muted" style={{ marginBottom: 8 }}>Contact access:</p>
            <div className="quick-links">
              {profile.email ? <a className="gold-btn" href={`mailto:${profile.email}`}>Email professional</a> : <button className="gold-btn" type="button" disabled>Contact unavailable</button>}
              <Link className="gold-btn" href="/directory">Browse more profiles</Link>
            </div>
            <div style={{ marginTop: 24 }}>
              <h2 style={{ margin: "0 0 0.75rem" }}>Recent media & updates</h2>
              {posts.length === 0 ? (
                <p className="muted">No public posts published yet.</p>
              ) : (
                <div className="submissions-list">
                  {posts.map((post) => (
                    <article className="submission-item" key={post.id}>
                      <h3 style={{ margin: 0 }}>{post.title || "Untitled"}</h3>
                      <p className="muted" style={{ margin: "0.25rem 0" }}>{post.post_type || "Content"}</p>
                      <p style={{ margin: 0 }}>{post.body ? post.body.slice(0, 120) : post.link_url || post.media_url || "Media content"}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
