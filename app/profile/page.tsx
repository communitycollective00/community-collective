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
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
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

    const loadProfile = async () => {
      const { data: profile, error: profileError } = await (getSupabaseClient().from("profiles") as any)
        .select(
          "full_name,username,bio,description,city,state,industry,website,instagram,twitter,linkedin,avatar_url,banner_url"
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
      if (profile.description != null) setDescription(profile.description);
      if (profile.city != null) setCity(profile.city);
      if (profile.state != null) setStateRegion(profile.state);
      if (profile.industry != null) setIndustry(profile.industry);
      if (profile.website != null) setWebsite(profile.website);
      if (profile.instagram != null) setInstagram(profile.instagram);
      if (profile.twitter != null) setTwitter(profile.twitter);
      if (profile.linkedin != null) setLinkedin(profile.linkedin);
      if (profile.avatar_url != null) setAvatarUrl(profile.avatar_url);
      if (profile.banner_url != null) setBannerUrl(profile.banner_url);
    };

    loadProfile();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px" }}>
        <section className="premium-card">
          <h1>Loading profile…</h1>
          <p className="muted">We are restoring your premium workspace.</p>
        </section>
      </main>
    );
  }

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

  const uploadBanner = async (file: File) => {
    if (!userId) return;
    setStatus("Uploading banner...");
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await getSupabaseClient().storage.from("media").upload(path, file, { upsert: true });
    if (error) {
      setStatus(error.message);
      return;
    }
    const { data } = getSupabaseClient().storage.from("media").getPublicUrl(path);
    setBannerUrl(data.publicUrl);
    setStatus("Banner uploaded.");
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
      description,
      city,
      state: stateRegion,
      industry,
      website,
      instagram,
      twitter,
      linkedin,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
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

  const hasProfileContent = Boolean(fullName || username || bio || description || industry || website || instagram || twitter || linkedin || bannerUrl);
  const profileHeadline = hasProfileContent ? "Manage your public profile" : "Complete your profile";
  const profileSubtext = hasProfileContent
    ? "Update how community members discover you in the directory, and keep your contact details, expertise, and social links current."
    : "Finish your crafted profile so the platform can represent your expertise with the premium visibility it deserves.";

  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: "1100px", margin: "2rem auto" }}>
        <div className="page-panel-inner">
          <div>
            <p className="homepage-kicker">Member profile</p>
            <h1 className="homepage-section-title" style={{ marginBottom: "0.5rem" }}>{profileHeadline}</h1>
            <p className="homepage-section-text" style={{ marginBottom: 0 }}>{profileSubtext}</p>
          </div>

          {!hasProfileContent ? (
            <div className="status-success" style={{ maxWidth: "760px" }}>
              Your profile is waiting for a few key details. Add your name, bio, location, and links to be more discoverable in the Directory.
            </div>
          ) : null}

          <div className="page-panel" style={{ padding: "1.75rem" }}>
            {bannerUrl ? (
              <div
                style={{
                  marginBottom: "1rem",
                  minHeight: "180px",
                  borderRadius: "18px",
                  backgroundImage: `url(${bannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : null}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <img src={avatarUrl || fallbackAvatar(fullName || username)} alt="Avatar preview" className="profile-avatar" />
              <div style={{ minWidth: 0 }}>
                <p className="muted" style={{ margin: 0 }}>Profile preview</p>
                <p style={{ margin: "0.5rem 0 0", fontSize: "1rem", color: "#f4e7c1" }}>{fullName || username || "Your name"}</p>
                <p className="muted" style={{ margin: "0.25rem 0 0" }}>{industry || "Industry"} • {city || stateRegion ? `${city}${city && stateRegion ? ", " : ""}${stateRegion}` : "Location"}</p>
                {description ? <p className="muted" style={{ margin: "0.75rem 0 0", lineHeight: 1.5 }}>{description}</p> : null}
              </div>
            </div>
          </div>

          <form onSubmit={save} className="premium-form form-grid">
            <div className="form-row">
              <div>
                <label className="field-label">Email</label>
                <input className="page-input" disabled value={email} />
              </div>
              <div>
                <label className="field-label">Username</label>
                <input
                  className="page-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label className="field-label">Full name</label>
                <input className="page-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className="field-label">Industry / field</label>
                <input className="page-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" />
              </div>
            </div>

            <textarea
              className="page-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio"
              rows={4}
            />

            <div className="form-row">
              <input className="page-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              <input className="page-input" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State" />
            </div>

            <textarea
              className="page-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Longer profile description"
              rows={4}
            />
            <input className="page-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" />
            <input className="page-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" />
            <input className="page-input" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter / X" />
            <input className="page-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />

            <div className="page-search">
              <label className="field-label">Banner image</label>
              <input className="page-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])} />
              <p className="muted page-note">Upload a large header image for your public profile.</p>
            </div>

            <div className="page-search">
              <label className="field-label">Avatar</label>
              <input className="page-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <p className="muted page-note">Image upload uses Supabase storage when available. If you prefer not to upload an image, leave it blank.</p>
            </div>

            <button className="gold-btn" type="submit">Save profile</button>
          </form>

          {status ? <p className="muted page-note">{status}</p> : null}
        </div>
      </section>
    </main>
  );
}
