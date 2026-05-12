"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

function friendlyLoginError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) return "Incorrect email or password.";
  if (lower.includes("email not confirmed")) return "Please confirm your email before logging in.";
  return "Could not sign you in right now. Please try again.";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const next = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("next") || "/dashboard") : "/dashboard";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const errorCode = new URLSearchParams(window.location.search).get("error");
    if (errorCode === "auth_callback_failed") setStatus("We couldn't complete that sign-in. Please try again.");
    if (errorCode === "profile_provision_failed") setStatus("Your account signed in, but we couldn't finish setup. Please sign in once more.");
  }, []);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Signing in...");
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) setStatus(friendlyLoginError(error.message));
    else window.location.href = next;
  };

  const googleLogin = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) {
      if (error.message.toLowerCase().includes("provider") || error.message.toLowerCase().includes("oauth")) {
        setStatus("Google sign-in is being connected. Please use email signup for now.");
      } else {
        setStatus("Google sign-in is temporarily unavailable. Please use email login for now.");
      }
    }
  };

  const magicLink = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    setStatus(error ? "Could not send magic link right now. Please verify your email and try again." : "Magic link sent. Check your inbox.");
  };

  return <main className="premium-page"><AuthNavbar /><section className="premium-card"><h1>Login</h1><p>Use email + password, Google, or magic link backup.</p><form onSubmit={login} className="premium-form"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /><button className="gold-btn" type="submit">Login</button></form><div className="quick-links"><button className="gold-btn" onClick={googleLogin}>Continue with Google</button><button className="gold-btn" onClick={magicLink}>Send Magic Link (Backup)</button></div>{status && <p className="muted">{status}</p>}</section></main>;
}
