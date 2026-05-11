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
  const [skills, setSkills] = useState("");
  const [socials, setSocials] = useState("");
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
        .select("full_name,username,bio,city,state,skills,socials")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setUsername(profile.username ?? "");
        setBio(profile.bio ?? "");
        setCity(profile.city ?? "");
        setStateRegion(profile.state ?? "");
        setSkills(profile.skills ?? "");
        setSocials(profile.socials ?? "");
      }
    };

    load();
  }, []);

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
        skills,
        socials,
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
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={4} />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          <input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State" />
          <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" />
          <textarea value={socials} onChange={(e) => setSocials(e.target.value)} placeholder="Social links (comma separated)" rows={3} />
          <button className="gold-btn" type="submit">Save</button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
