"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { fallbackAvatar, filterProfilePayload } from "../../lib/profile-fields";
import { useAuth } from "../components/auth-provider";

export default function ProfilePage() {
  const { user, profile: providerProfile, loading: authLoading } = useAuth();
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
    if (authLoading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setUserId(user.id);
    setEmail(user.email ?? "");

    // Provider already fetched basic profile; fetch any additional fields needed
    const loadProfile = async () => {
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

    loadProfile();
  }, [user, authLoading]);

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
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card dashboard-card">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <p className="muted" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.8rem" }}>Member profile</p>
            <h1 style={{ margin: "0.5rem 0 0", fontSize: "2.2rem" }}>Manage your public profile</h1>
            <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "740px" }}>Update how community members discover you in the directory, and keep your contact details, expertise, and social links current.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <img src={avatarUrl || fallbackAvatar(fullName || username)} alt="Avatar preview" className="profile-avatar" />
              <div style={{ minWidth: 0 }}>
                <p className="muted" style={{ margin: 0 }}>Profile preview</p>
                <p style={{ margin: "0.5rem 0 0", fontSize: "1rem", color: "#f4e7c1" }}>{fullName || username || "Your name"}</p>
                <p className="muted" style={{ margin: "0.25rem 0 0" }}>{industry || "Industry"} • {city || stateRegion ? `${city}${city && stateRegion ? ", " : ""}${stateRegion}` : "Location"}</p>
              </div>
            </div>

            <form onSubmit={save} className="premium-form" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="field-label">Email</label>
                  <input disabled value={email} />
                </div>
                <div>
                  <label className="field-label">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))} placeholder="Username" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="field-label">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="field-label">Industry / field</label>
                  <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" />
                </div>
              </div>

              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={4} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                <input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State" />
              </div>

              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" />
              <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" />
              <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter / X" />
              <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />

              <div style={{ display: "grid", gap: "0.75rem" }}>
                <label className="field-label">Avatar</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                <small className="muted">Image upload uses Supabase storage when available. If you prefer not to upload an image, leave it blank.</small>
              </div>

              <button className="gold-btn" type="submit">Save profile</button>
            </form>
          </div>

          {status ? <p className="muted">{status}</p> : null}
        </div>
      </section>
    </main>
  );
}
