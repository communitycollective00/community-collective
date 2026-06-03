"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { fallbackAvatar, filterProfilePayload, calculateProfileCompletion } from "../../lib/profile-fields";
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
  const [lookingFor, setLookingFor] = useState("");
  const [canOffer, setCanOffer] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");
  const [showEdit, setShowEdit] = useState(false);

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
          "full_name,username,bio,description,city,state,industry,website,instagram,twitter,linkedin,avatar_url,banner_url,looking_for,can_offer"
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
      if (profile.looking_for != null) setLookingFor(profile.looking_for);
      if (profile.can_offer != null) setCanOffer(profile.can_offer);
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
      looking_for: lookingFor,
      can_offer: canOffer,
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

  const profileCompletion = calculateProfileCompletion({
    full_name: fullName,
    username,
    industry,
    city,
    state: stateRegion,
    bio,
    description,
    website,
    avatar_url: avatarUrl,
  });

  const avatarDisplay = avatarUrl || fallbackAvatar(fullName || username);
  const locationDisplay = [city, stateRegion].filter(Boolean).join(", ") || "Location";

  return (
    <main className="premium-page profile-page" style={{ paddingTop: "72px" }}>
      <section className="profile-grid" style={{ maxWidth: "1200px", margin: "2rem auto", display: "grid", gridTemplateColumns: "1.35fr 0.95fr", gap: "1.5rem" }}>
        <div className="profile-summary-card">
          <div
            className="profile-banner"
            style={{ backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined }}
          >
            <div className="profile-banner-overlay" />
            {!bannerUrl && (
              <div className="profile-banner-empty">
                <p className="profile-banner-empty-text">Add a banner to make your public profile stand out.</p>
              </div>
            )}
          </div>

          <div className="profile-summary-body">
            <div className="profile-summary-top">
              <div className="profile-avatar-wrap">
                <img src={avatarDisplay} alt="Avatar preview" className="profile-avatar-large" />
              </div>
              <div className="profile-summary-meta">
                <p className="profile-badge">{industry || "Industry"}</p>
                <h1 className="profile-title">{fullName || username || "Your name"}</h1>
                <p className="profile-handle">@{username || "username"}</p>
                <p className="profile-location">{locationDisplay}</p>
              </div>
            </div>

            {bio ? <p className="profile-bio">{bio}</p> : <p className="profile-bio muted">Share a short description of your expertise and what makes you memorable.</p>}

            <div className="profile-social-links">
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className="profile-link">
                  Website
                </a>
              ) : null}
              {instagram ? (
                <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                  Instagram
                </a>
              ) : null}
              {linkedin ? (
                <a href={`https://linkedin.com/in/${linkedin.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                  LinkedIn
                </a>
              ) : null}
              {twitter ? (
                <a href={`https://twitter.com/${twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                  Twitter / X
                </a>
              ) : null}
            </div>

            <div className="profile-completion-card">
              <div className="profile-completion-header">
                <div>
                  <p className="section-overline">Profile completion</p>
                  <p className="profile-completion-copy">Your premium profile readiness score</p>
                </div>
                <span className="profile-completion-score">{profileCompletion.percentage}%</span>
              </div>

              <div className="profile-progress-bar">
                <div className="profile-progress-fill" style={{ width: `${profileCompletion.percentage}%` }} />
              </div>

              <p className="profile-completion-summary">
                {profileCompletion.completed} of {profileCompletion.total} sections complete
              </p>

              {profileCompletion.missingFields.length > 0 && (
                <div className="profile-missing-list">
                  <p className="muted" style={{ margin: 0 }}>Missing: {profileCompletion.missingFields.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-edit-panel">
          <div className="profile-section-card profile-editor-summary">
            <div className="profile-card-header">
              <p className="section-overline">Profile editor</p>
              <p className="page-copy" style={{ margin: 0 }}>Edit and publish the profile that appears to community members.</p>
            </div>

            <div className="profile-editor-state">
              <span className="profile-editor-pill">{profileCompletion.percentage}% complete</span>
              <button type="button" className="gold-btn profile-edit-toggle" onClick={() => setShowEdit((prev) => !prev)}>
                {showEdit ? "Hide editor" : "Open editor"}
              </button>
            </div>

            {!showEdit && (
              <div className="profile-editor-summary-list">
                <p className="muted" style={{ margin: "0 0 0.75rem" }}>
                  Edit the profile sections below when you're ready.
                </p>
                <ul>
                  <li>Identity & role</li>
                  <li>Bio & description</li>
                  <li>Location</li>
                  <li>Links & media</li>
                </ul>
              </div>
            )}

            {status ? <p className="muted page-note" style={{ marginTop: "1rem" }}>{status}</p> : null}
          </div>

          <form onSubmit={save} className="profile-edit-form">
            {showEdit && (
              <>
                <div className="profile-section-card">
                  <div className="profile-card-header">
                    <p className="section-overline">Identity</p>
                    <p className="page-copy" style={{ margin: 0 }}>Your professional name, handle, and role.</p>
                  </div>

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
                      <label className="field-label">Industry / role</label>
                      <input className="page-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" />
                    </div>
                  </div>
                </div>

                <div className="profile-section-card">
                  <div className="profile-card-header">
                    <p className="section-overline">Location</p>
                    <p className="page-copy" style={{ margin: 0 }}>Where you are based.</p>
                  </div>

                  <div className="form-row">
                    <div>
                      <label className="field-label">City</label>
                      <input className="page-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                    </div>
                    <div>
                      <label className="field-label">State</label>
                      <input className="page-input" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State" />
                    </div>
                  </div>
                </div>

                <div className="profile-section-card">
                  <div className="profile-card-header">
                    <p className="section-overline">Bio</p>
                    <p className="page-copy" style={{ margin: 0 }}>Short and long profile content for your audience.</p>
                  </div>

                  <label className="field-label">Short bio</label>
                  <textarea
                    className="page-input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short bio"
                    rows={4}
                  />

                  <label className="field-label" style={{ marginTop: "1rem" }}>Full description</label>
                  <textarea
                    className="page-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Longer profile description"
                    rows={5}
                  />
                </div>

                <div className="profile-section-card">
                  <div className="profile-card-header">
                    <p className="section-overline">Links</p>
                    <p className="page-copy" style={{ margin: 0 }}>Add your website and social handles.</p>
                  </div>

                  <input className="page-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website URL" />
                  <input className="page-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram" />
                  <input className="page-input" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="Twitter / X" />
                  <input className="page-input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />
                </div>

                <div className="profile-section-card">
                  <div className="profile-card-header">
                    <p className="section-overline">Media</p>
                    <p className="page-copy" style={{ margin: 0 }}>Upload your banner and avatar images.</p>
                  </div>

                  <label className="field-label">Banner image</label>
                  <input className="page-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])} />
                  <p className="muted page-note">Upload a large header image for your public profile.</p>

                  <label className="field-label" style={{ marginTop: "1rem" }}>Avatar</label>
                  <input className="page-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                  <p className="muted page-note">Upload a circular profile image with a gold border.</p>
                </div>

                <div className="page-actions" style={{ justifyContent: "flex-end" }}>
                  <button className="gold-btn" type="submit">Save profile</button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
