"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthNavbar from "../../components/auth-navbar";
import { getSupabaseClient } from "../../../lib/supabase";

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
  role: "community" | "verified" | "admin" | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,bio,city,state,industry,website,instagram,linkedin,avatar_url,role")
        .eq("username", username)
        .maybeSingle();

      setProfile(data ?? null);
    })();
  }, [username]);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        {!profile ? <p>User not found.</p> : (
          <>
            <h1>{profile.full_name || profile.username} {profile.role && profile.role !== "community" ? <span className="verify-badge">{profile.role === "admin" ? "Admin" : "Verified"}</span> : null}</h1>
            <p className="muted">@{profile.username}</p>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Profile avatar" className="profile-avatar" /> : null}
            <p>{profile.bio || "No bio yet."}</p>
            <p><strong>Industry:</strong> {profile.industry || "General"}</p>
            <p><strong>City:</strong> {[profile.city, profile.state].filter(Boolean).join(", ") || "Unknown"}</p>
            <p><strong>Website:</strong> {profile.website ? <a className="gold-link" href={profile.website} target="_blank">Visit</a> : "None"}</p>
            <p><strong>Instagram:</strong> {profile.instagram || "None"}</p>
            <p><strong>LinkedIn:</strong> {profile.linkedin || "None"}</p>
          </>
        )}
      </section>
    </main>
  );
}
