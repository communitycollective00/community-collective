"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AuthNavbar from "../../components/auth-navbar";
import { getSupabaseClient } from "../../../lib/supabase";
import { fallbackAvatar } from "../../../lib/profile-fields";

type PublicProfile = {
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
  featured: boolean | null;
  social_links: string | null;
  created_at: string | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,bio,city,state,industry,website,instagram,linkedin,avatar_url,featured,social_links,created_at")
        .eq("username", username)
        .maybeSingle();
      setProfile(data ?? null);
    })();
  }, [username]);

  const socialLinks = useMemo(() => {
    if (!profile?.social_links) return {} as Record<string, string>;
    try { return JSON.parse(profile.social_links); } catch { return {}; }
  }, [profile?.social_links]);

  return <main className="premium-page"><AuthNavbar /><section className="premium-card">
    {!profile ? <p>User not found.</p> : <>
      <img src={profile.avatar_url || fallbackAvatar(profile.full_name || profile.username)} alt="Profile avatar" className="profile-avatar" />
      <h1>{profile.full_name || profile.username} {profile.featured ? <span className="verify-badge">Featured</span> : null}</h1>
      <p className="muted">@{profile.username}</p>
      <p>{profile.bio || "No bio yet."}</p>
      <p><strong>Category:</strong> {profile.industry || "General"}</p>
      <p><strong>Location:</strong> {[profile.city, profile.state].filter(Boolean).join(", ") || "Unknown"}</p>
      <p><strong>Website:</strong> {profile.website ? <a className="gold-link" href={profile.website} target="_blank">Visit</a> : "None"}</p>
      <p><strong>Instagram:</strong> {profile.instagram || socialLinks.instagram || "None"}</p>
      <p><strong>TikTok:</strong> {socialLinks.tiktok || "None"}</p>
      <p><strong>YouTube:</strong> {socialLinks.youtube || "None"}</p>
      <p><strong>LinkedIn:</strong> {profile.linkedin || socialLinks.linkedin || "None"}</p>
      <p className="muted">Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}</p>
    </>}
  </section></main>;
}
