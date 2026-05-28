"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <section className="premium-card">
        {!profile ? (
          <p>User not found.</p>
        ) : (
          <>
            <div className="profile-banner" />
            <div className="profile-intro">
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <img src={profile.avatar_url || fallbackAvatar(profile.full_name || profile.username)} alt="Profile avatar" className="profile-avatar" />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <h1 style={{ margin: 0, fontSize: "2.4rem", lineHeight: 1 }}>{profile.full_name || profile.username}</h1>
                    <span className="verify-badge">{isProfessionalRole(profile.role) ? "Verified professional" : "Member profile"}</span>
                  </div>
                  <p className="muted" style={{ margin: "0.5rem 0 0" }}>@{profile.username || "unknown"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                <p style={{ margin: 0, color: "#d8c88f", fontSize: "1rem", lineHeight: 1.7 }}>{profile.bio || profile.description || "No bio yet."}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem" }}>
                  <span className="directory-badge">{profile.category || profile.industry || "General"}</span>
                  <span className="directory-badge">{profile.location || [profile.city, profile.state].filter(Boolean).join(", ") || "Unknown location"}</span>
                </div>
              </div>

              <div className="profile-socials" style={{ marginTop: "1rem" }}>
                {profile.email ? <a className="profile-link" href={`mailto:${profile.email}`}>Email professional</a> : null}
                {profile.website ? <a className="profile-link" href={profile.website} target="_blank" rel="noreferrer">Website</a> : null}
                {profile.instagram ? <a className="profile-link" href={`https://instagram.com/${profile.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer">Instagram</a> : null}
                {profile.twitter ? <a className="profile-link" href={`https://twitter.com/${profile.twitter.replace(/^@/, "")}`} target="_blank" rel="noreferrer">Twitter</a> : null}
                {profile.linkedin ? <a className="profile-link" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> : null}
                {profile.youtube ? <a className="profile-link" href={profile.youtube} target="_blank" rel="noreferrer">YouTube</a> : null}
                {profile.tiktok ? <a className="profile-link" href={`https://tiktok.com/@${profile.tiktok.replace(/^@/, "")}`} target="_blank" rel="noreferrer">TikTok</a> : null}
              </div>

              <div style={{ marginTop: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#f4e8c1" }}>Recent media & updates</h2>
                  <Link className="gold-link" href="/directory">Browse more profiles</Link>
                </div>

                {posts.length === 0 ? (
                  <p className="muted" style={{ marginTop: "1rem" }}>No public posts published yet.</p>
                ) : (
                  <div className="submissions-list" style={{ marginTop: "1rem" }}>
                    {posts.map((post) => (
                      <article className="post-card" key={post.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ margin: 0 }}>{post.title || "Untitled"}</h3>
                            <p className="muted" style={{ margin: "0.3rem 0" }}>{post.post_type ? post.post_type.toUpperCase() : "Update"}</p>
                          </div>
                          {post.link_url ? <a className="profile-link" href={post.link_url} target="_blank" rel="noreferrer">Open link</a> : post.media_url ? <a className="profile-link" href={post.media_url} target="_blank" rel="noreferrer">View media</a> : null}
                        </div>
                        <p style={{ margin: "0.75rem 0 0", color: "#d3c18e", lineHeight: 1.75 }}>{post.body ? post.body.slice(0, 140) : "No description provided."}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
