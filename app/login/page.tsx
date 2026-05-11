"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const sendLink = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Sending magic link...");

    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setStatus(error ? error.message : "Magic link sent. Check your email.");
  };

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <h1>Login</h1>
        <p>Sign in with a secure email magic link.</p>
        <form onSubmit={sendLink} className="premium-form">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button className="gold-btn" type="submit">Send Magic Link</button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
