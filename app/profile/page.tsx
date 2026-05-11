"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
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
        .select("full_name,bio")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setBio(profile.bio ?? "");
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
        bio,
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
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={5} />
          <button className="gold-btn" type="submit">Save</button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
