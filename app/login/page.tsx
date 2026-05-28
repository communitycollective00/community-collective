"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";
function friendlyLoginError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials") || lower.includes("invalid password") || lower.includes("invalid email")) {
    return "Invalid email or password.";
  }
  if (lower.includes("email not confirmed")) return "Please confirm your email before logging in.";
  return message;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const errorCode = new URLSearchParams(window.location.search).get("error");
    if (errorCode === "auth_callback_failed") setStatus("We couldn't complete that sign-in. Please try again.");
    if (errorCode === "profile_provision_failed") setStatus("Your account signed in, but we couldn't finish setup. Please sign in once more.");
  }, []);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Signing in...");
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });

      if (error) {
        console.error("Login failed:", error);
        setStatus(friendlyLoginError(error.message));
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred while signing in.";
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    if (error) {
      if (error.message.toLowerCase().includes("provider") || error.message.toLowerCase().includes("oauth")) {
        setStatus("Google sign-in is being connected. Please use email signup for now.");
      } else {
        setStatus("Google sign-in is temporarily unavailable. Please use email login for now.");
      }
    }
  };

  const magicLink = async () => {
    setStatus("Sending magic link...");
    const { error } = await getSupabaseClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    if (error) {
      setStatus(`Magic link failed: ${error.message}. You can still sign in with email and password.`);
    } else {
      setStatus("Magic link sent. Check your inbox.");
    }
  };

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card">
        <h1 style={{ fontSize: "2.8rem", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Welcome back.</h1>
        <p style={{ color: "#d3c18e", marginBottom: "1.5rem", maxWidth: "640px" }}>Sign in securely to access your dashboard, profile, and premium directory tools.</p>

        <form onSubmit={login} className="premium-form">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button className="gold-btn" type="submit" disabled={isLoading}>Login</button>
        </form>

        <div className="quick-links">
          <button type="button" className="gold-btn" onClick={googleLogin} disabled={!googleEnabled} title={!googleEnabled ? "Google sign-in coming soon" : "Continue with Google"}>
            {googleEnabled ? "Continue with Google" : "Google sign-in coming soon"}
          </button>
          <button type="button" className="gold-btn" onClick={magicLink}>Send Magic Link (Backup)</button>
        </div>

        <p className="muted" style={{ marginTop: 12 }}>Don't have an account? <Link href="/signup" className="gold-link">Sign up</Link></p>

        {!googleEnabled && <p className="muted">Google sign-in coming soon. Please use email login or magic link.</p>}
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
