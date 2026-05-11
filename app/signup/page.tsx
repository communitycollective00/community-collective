"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("");

  const signup = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Sending signup magic link...");

    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setStatus(error ? error.message : "Check your email to complete signup.");
  };

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <h1>Create account</h1>
        <form onSubmit={signup} className="premium-form">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button className="gold-btn" type="submit">Sign up with Magic Link</button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
