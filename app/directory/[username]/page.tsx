"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthNavbar from "../../components/auth-navbar";
import { getSupabaseClient } from "../../../lib/supabase";
import { fallbackAvatar } from "../../../lib/profile-fields";

type PublicProfile = {
  display_name: string | null;
  username: string | null;
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
  is_featured: boolean | null;
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
        .select("display_name,username,bio,description,category,industry,location,city,state,website,instagram,tiktok,youtube,twitter,linkedin,avatar_url,is_featured,created_at")
        .eq("username", username)
        .maybeSingle();
      setProfile(data ?? null);
    })();
  }, [username]);

  return <main className="premium-page"><AuthNavbar /><section className="premium-card">
    {!profile ? <p>User not found.</p> : <>
      <img src={profile.avatar_url || fallbackAvatar(profile.display_name || profile.username)} alt="Profile avatar" className="profile-avatar" />
      <h1>{profile.display_name || profile.username} {profile.is_featured ? <span className="verify-badge">Featured</span> : null}</h1>
      <p className="muted">@{profile.username}</p>
      <p>{profile.bio || profile.description || "No bio yet."}</p>
      <p><strong>Category:</strong> {profile.category || profile.industry || "General"}</p>
      <p><strong>Location:</strong> {profile.location || [profile.city, profile.state].filter(Boolean).join(", ") || "Unknown"}</p>
      <p><strong>Website:</strong> {profile.website ? <a className="gold-link" href={profile.website} target="_blank">Visit</a> : "None"}</p>
      <p><strong>Instagram:</strong> {profile.instagram || "None"}</p><p><strong>TikTok:</strong> {profile.tiktok || "None"}</p>
      <p><strong>YouTube:</strong> {profile.youtube || "None"}</p><p><strong>Twitter/X:</strong> {profile.twitter || "None"}</p>
      <p><strong>LinkedIn:</strong> {profile.linkedin || "None"}</p>
      <p className="muted">Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}</p>
    </>}
  </section></main>;
}
