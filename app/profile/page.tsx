"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
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

      const { data: profile } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,bio,city,state,industry,website,instagram,linkedin,avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setUsername(profile.username ?? "");
        setBio(profile.bio ?? "");
        setCity(profile.city ?? "");
        setStateRegion(profile.state ?? "");
        setIndustry(profile.industry ?? "");
        setWebsite(profile.website ?? "");
        setInstagram(profile.instagram ?? "");
        setLinkedin(profile.linkedin ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }
    };

    load();
  }, []);

  const uploadAvatar = async (file: File) => {
    if (!userId) return;
    setStatus("Uploading avatar...");
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await getSupabaseClient().storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      setStatus(error.message);
      return;
    }
    const { data } = getSupabaseClient().storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setStatus("Avatar uploaded.");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Saving profile...");

    const { error } = await (getSupabaseClient().from("profiles") as any).upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        username,
        bio,
        city,
        state: stateRegion,
        industry,
        website,
        instagram,
        linkedin,
        avatar_url: avatarUrl,
        role: "community",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    setStatus(error ? error.message : "Profile updated.");
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
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          {avatarUrl ? <img src={avatarUrl} alt="Avatar preview" className="profile-avatar" /> : null}
          <button className="gold-btn" type="submit">Save</button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
