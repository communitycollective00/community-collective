"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const next = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("next") || "/dashboard") : "/dashboard";

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Signing in...");
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) setStatus(error.message);
    else window.location.href = next;
  };

  const googleLogin = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) setStatus(error.message);
  };

  const magicLink = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setStatus(error ? error.message : "Magic link sent.");
  };

  return <main className="premium-page"><AuthNavbar /><section className="premium-card"><h1>Login</h1><p>Use email + password, Google, or magic link backup.</p><form onSubmit={login} className="premium-form"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /><button className="gold-btn" type="submit">Login</button></form><div className="quick-links"><button className="gold-btn" onClick={googleLogin}>Continue with Google</button><button className="gold-btn" onClick={magicLink}>Send Magic Link (Backup)</button></div>{status && <p className="muted">{status}</p>}</section></main>;
}
