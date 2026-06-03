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
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: "1120px", margin: "2rem auto", padding: "2rem" }}>
        <div className="page-panel-inner" style={{ display: "grid", gap: "2rem" }}>
          <div className="homepage-section-grid homepage-section-grid--split" style={{ gap: "2rem", alignItems: "start" }}>
            <div>
              <p className="homepage-kicker">Member profile</p>
              <h1 className="homepage-section-title" style={{ marginBottom: "0.75rem" }}>
                Your profile is how people understand what you do, what you know, and how to connect with you.
              </h1>
              <p className="homepage-section-text" style={{ marginBottom: 0 }}>
                Trust starts with clarity. Use this page to define your role in the network, the opportunities you are seeking, and the expertise you bring to community work.
              </p>
            </div>

            <div className="homepage-section homepage-section--dark" style={{ padding: "1.75rem", borderRadius: "18px" }}>
              <p className="homepage-kicker">Profile access card</p>
              <p className="homepage-feature-copy" style={{ marginBottom: "1rem" }}>
                This is your public introduction in Community Collective. Keep it clear, concise, and centered on what you can offer and who you want to connect with.
              </p>
              <div style={{ display: "grid", gap: "0.85rem" }}>
                <p className="homepage-feature-copy">• Who you are in the network</p>
                <p className="homepage-feature-copy">• What expertise you bring</p>
                <p className="homepage-feature-copy">• What opportunities you are looking for</p>
              </div>
            </div>
          </div>

          {!hasProfileContent ? (
            <div className="status-success" style={{ maxWidth: "760px" }}>
              Your profile is waiting for a few key details. Add your name, bio, location, and links so people can trust your work and connect with you more easily.
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
            
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 auto" }}>
                  <img 
                    src={avatarDisplay} 
                    alt="Avatar preview" 
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "3px solid #f4cf70",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Profile Preview</p>
                  <p style={{ margin: "0.5rem 0 0", fontSize: "1.1rem", fontWeight: 600, color: "#f4e7c1" }}>
                    {fullName || username || "Your name"}
                  </p>
                  <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                    {industry || "Industry"} {locationDisplay !== "Location" && `• ${locationDisplay}`}
                  </p>
                  {bio ? <p className="muted" style={{ margin: "0.75rem 0 0", lineHeight: 1.5, fontSize: "0.9rem" }}>{bio}</p> : null}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(244, 207, 112, 0.12)", paddingTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: "#f4e7c1" }}>Profile Completion</p>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#f4cf70" }}>{profileCompletion.percentage}%</p>
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(244, 207, 112, 0.1)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${profileCompletion.percentage}%`,
                    height: "100%",
                    backgroundColor: "#f4cf70",
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#c89d35" }}>
                  {profileCompletion.completed} of {profileCompletion.total} sections complete
                </p>
                {profileCompletion.missingFields.length > 0 && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#d3c18e" }}>Missing: {profileCompletion.missingFields.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={save} className="premium-form" style={{ display: "grid", gap: "1.5rem" }}>
            <div className="homepage-section-grid homepage-section-grid--split" style={{ gap: "1rem" }}>
              <div>
                <p className="homepage-feature-title">Identity & role</p>
                <p className="homepage-feature-copy">Use the fields below to define who you are and how you want to be found.</p>
              </div>
              <div>
                <p className="homepage-feature-title">Visibility & contact</p>
                <p className="homepage-feature-copy">Keep your public handles and website current so trusted introductions can reach you easily.</p>
              </div>
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
                <p className="muted page-note" style={{ marginTop: "0.5rem" }}>
                  This is your public handle in the directory.
                </p>
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

            <div>
              <label className="field-label">Short bio</label>
              <textarea
                className="page-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio"
                rows={4}
              />
              <p className="muted page-note" style={{ marginTop: "0.5rem" }}>
                Share what you do, who you serve, and what access or opportunities you are looking for.
              </p>
            </div>

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

            <div className="form-row">
              <div>
                <label className="field-label">What are you looking for?</label>
                <textarea
                  className="page-input"
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="Opportunities, collaborations, mentorship, etc."
                  rows={3}
                />
              </div>
              <div>
                <label className="field-label">What can you offer?</label>
                <textarea
                  className="page-input"
                  value={canOffer}
                  onChange={(e) => setCanOffer(e.target.value)}
                  placeholder="Skills, expertise, connections, resources, etc."
                  rows={3}
                />
              </div>
            </div>

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
