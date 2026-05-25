"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { fallbackAvatar, filterProfilePayload } from "../../lib/profile-fields";
import AuthNavbar from "../components/auth-navbar";

type SocialState = {
  instagram: string;
  twitter: string;
  linkedin: string;
};

const categories = ["Creator", "Brand", "Entrepreneur", "Artist", "Producer", "Community Builder", "Other"];

export default function OnboardingPage() {
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [cityState, setCityState] = useState("");
  const [website, setWebsite] = useState("");
  const [whatDoYouDo, setWhatDoYouDo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [socials, setSocials] = useState<SocialState>({ instagram: "", twitter: "", linkedin: "" });
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

      const { data: profile } = await (getSupabaseClient().from("profiles") as any)
        .select("full_name,username,bio,category,industry,location,city,state,website,instagram,tiktok,youtube,twitter,linkedin,avatar_url,description")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) return;

      setFullName(profile.full_name ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
      setCategory(profile.category ?? profile.industry ?? "");
      setWebsite(profile.website ?? "");
      setWhatDoYouDo(profile.description ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      const combinedCityState = [profile.city, profile.state].filter(Boolean).join(", ");
      setCityState(combinedCityState);

      setSocials({
        instagram: profile.instagram ?? "",
        twitter: profile.twitter ?? "",
        linkedin: profile.linkedin ?? "",
      });
    };
    load();
  }, []);

  const splitLocation = useMemo(() => {
    const [city, ...rest] = cityState.split(",");
    return { city: city?.trim() ?? "", state: rest.join(",").trim() };
  }, [cityState]);

  const uploadAvatar = async (file: File) => {
    if (!userId) return;
    setStatus("Uploading avatar...");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error } = await getSupabaseClient().storage.from("media").upload(path, file, { upsert: true });
    if (error) { setStatus(error.message); return; }
    const { data } = getSupabaseClient().storage.from("media").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setStatus("Avatar updated.");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
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
        username,
        bio,
        category,
        industry: category,
        location: cityState,
        city: splitLocation.city,
        state: splitLocation.state,
        website,
        instagram: socials.instagram,
        linkedin: socials.linkedin,
        twitter: socials.twitter,
        description: whatDoYouDo,
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

    window.location.href = "/dashboard";
  };

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card onboarding-card">
        <h1>Complete your profile</h1>
        <p className="muted">Set up your member profile so people can discover what you do.</p>

        <form onSubmit={save} className="premium-form">
          <label className="field-label">Profile photo</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          <img src={avatarUrl || fallbackAvatar(fullName || username)} alt="Avatar preview" className="profile-avatar" />

          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))} placeholder="Username" />
          <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Category</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input value={cityState} onChange={(e) => setCityState(e.target.value)} placeholder="City, State" />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
          <input value={socials.instagram} onChange={(e) => setSocials((s) => ({ ...s, instagram: e.target.value }))} placeholder="Instagram" />
          <input value={socials.twitter} onChange={(e) => setSocials((s) => ({ ...s, twitter: e.target.value }))} placeholder="Twitter / X" />
          <input value={socials.linkedin} onChange={(e) => setSocials((s) => ({ ...s, linkedin: e.target.value }))} placeholder="LinkedIn" />
          <textarea rows={3} value={whatDoYouDo} onChange={(e) => setWhatDoYouDo(e.target.value)} placeholder="What do you do?" />

          <button className="gold-btn" type="submit">Save profile & continue</button>
          <Link className="muted" href="/dashboard">Skip for now</Link>
        </form>
        {status ? <p className="muted">{status}</p> : null}
      </section>
    </main>
  );
}
