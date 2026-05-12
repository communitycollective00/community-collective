"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

type SocialState = {
  instagram: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
};

const categories = ["Creator", "Brand", "Entrepreneur", "Artist", "Producer", "Community Builder", "Other"];

export default function OnboardingPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("");
  const [cityState, setCityState] = useState("");
  const [website, setWebsite] = useState("");
  const [whatDoYouDo, setWhatDoYouDo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [socials, setSocials] = useState<SocialState>({ instagram: "", tiktok: "", youtube: "", linkedin: "" });
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
        .select("full_name,username,bio,city,state,industry,website,instagram,linkedin,avatar_url,social_links,services_offered")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) return;

      setDisplayName(profile.full_name ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
      setCategory(profile.industry ?? "");
      setWebsite(profile.website ?? "");
      setWhatDoYouDo(profile.services_offered ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      const combinedCityState = [profile.city, profile.state].filter(Boolean).join(", ");
      setCityState(combinedCityState);

      let existing = {} as Record<string, string>;
      if (profile.social_links) {
        try {
          existing = JSON.parse(profile.social_links);
        } catch {
          existing = {};
        }
      }
      setSocials({
        instagram: profile.instagram ?? existing.instagram ?? "",
        tiktok: existing.tiktok ?? "",
        youtube: existing.youtube ?? "",
        linkedin: profile.linkedin ?? existing.linkedin ?? "",
      });
    };
    load();
  }, []);

  const splitLocation = useMemo(() => {
    const [city, ...rest] = cityState.split(",");
    return { city: city?.trim() ?? "", state: rest.join(",").trim() };
  }, [cityState]);

  const uploadAvatarPlaceholder = () => {
    setStatus("Photo upload placeholder added. Connect storage upload flow when ready.");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setStatus("Saving profile...");

    const { error } = await (getSupabaseClient().from("profiles") as any).upsert(
      {
        id: userId,
        email,
        full_name: displayName,
        username,
        bio,
        industry: category,
        city: splitLocation.city,
        state: splitLocation.state,
        website,
        instagram: socials.instagram,
        linkedin: socials.linkedin,
        social_links: JSON.stringify({
          instagram: socials.instagram,
          tiktok: socials.tiktok,
          youtube: socials.youtube,
          linkedin: socials.linkedin,
        }),
        services_offered: whatDoYouDo,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      setStatus(error.message);
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
          <button className="gold-link" type="button" onClick={uploadAvatarPlaceholder}>Upload photo (placeholder)</button>

          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
          <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))} placeholder="Username" />
          <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Category</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input value={cityState} onChange={(e) => setCityState(e.target.value)} placeholder="City, State" />
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
          <input value={socials.instagram} onChange={(e) => setSocials((s) => ({ ...s, instagram: e.target.value }))} placeholder="Instagram" />
          <input value={socials.tiktok} onChange={(e) => setSocials((s) => ({ ...s, tiktok: e.target.value }))} placeholder="TikTok" />
          <input value={socials.youtube} onChange={(e) => setSocials((s) => ({ ...s, youtube: e.target.value }))} placeholder="YouTube" />
          <input value={socials.linkedin} onChange={(e) => setSocials((s) => ({ ...s, linkedin: e.target.value }))} placeholder="LinkedIn" />
          <textarea rows={3} value={whatDoYouDo} onChange={(e) => setWhatDoYouDo(e.target.value)} placeholder="What do you do?" />

          <button className="gold-btn" type="submit">Save profile</button>
          <Link className="muted" href="/dashboard">Skip for now</Link>
        </form>
        {status ? <p className="muted">{status}</p> : null}
      </section>
    </main>
  );
}
