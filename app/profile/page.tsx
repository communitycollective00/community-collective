"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { fallbackAvatar, filterProfilePayload } from "../../lib/profile-fields";
import AuthNavbar from "../components/auth-navbar";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await getSupabaseClient().auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const user = data.session.user;
      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile, error: profileError } = await (getSupabaseClient().from("profiles") as any)
        .select(
          "full_name,username,bio,city,state,industry,website,instagram,twitter,linkedin,avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[profile] failed to load profile", profileError);
        return;
      }

      if (!profile) {
        return;
      }

      if (profile.full_name != null) setFullName(profile.full_name);
      if (profile.username != null) setUsername(profile.username);
      if (profile.bio != null) setBio(profile.bio);
      if (profile.city != null) setCity(profile.city);
      if (profile.state != null) setStateRegion(profile.state);
      if (profile.industry != null) setIndustry(profile.industry);
      if (profile.website != null) setWebsite(profile.website);
      if (profile.instagram != null) setInstagram(profile.instagram);
      if (profile.twitter != null) setTwitter(profile.twitter);
      if (profile.linkedin != null) setLinkedin(profile.linkedin);
      if (profile.avatar_url != null) setAvatarUrl(profile.avatar_url);
    };

    load();
  }, []);

  const uploadAvatar = async (file: File) => {
    if (!userId) return;
    setStatus("Uploading avatar...");
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await getSupabaseClient().storage.from("media").upload(path, file, { upsert: true });
    if (error) {
      setStatus(error.message);
      return;
    }
    const { data } = getSupabaseClient().storage.from("media").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setStatus("Avatar uploaded.");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setStatus("Not signed in.");
      return;
    }

    setStatus("Saving profile...");
    const { data: sessionData } = await getSupabaseClient().auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }

    const payload = filterProfilePayload({
        id: userId,
        full_name: fullName,
        category: industry,
        location: [city, stateRegion].filter(Boolean).join(", "),
        profile_completed: Boolean(fullName && username && bio && industry && city && stateRegion),
        username,
        bio,
        city,
        state: stateRegion,
        industry,
        website,
        instagram,
        twitter,
        linkedin,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

    const response = await fetch("/api/profiles/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus(result?.error || "Unable to save profile. Please try again.");
      return;
    }

    setStatus("Profile updated.");
  };

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <h1>Your Profile</h1>
        <form onSubmit={save} className="premium-form">
          <input disabled value={email} />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))} placeholder="Username" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={4} />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State" />
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" />
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" />
          <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter / X" />
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          <img src={avatarUrl || fallbackAvatar(fullName || username)} alt="Avatar preview" className="profile-avatar" />
          <button className="gold-btn" type="submit">Save</button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
