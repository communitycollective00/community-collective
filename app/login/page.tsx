"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard after successful auth
        console.log(`[LOGIN] signInWithPassword SUCCESS - redirecting to /dashboard`);
      router.replace('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred while signing in.";
      setStatus(message);
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
        <h1 style={{ fontSize: "2.8rem", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>Welcome back.</h1>
        <p style={{ color: "#d3c18e", marginBottom: "2rem", maxWidth: "640px", fontSize: "1rem", lineHeight: "1.6" }}>Sign in to your Community Collective account and access your dashboard, saved items, and the people and opportunities that matter to you.</p>

        <form onSubmit={login} className="premium-form">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <div style={{ position: "relative" }}>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button type="button" className="gold-link" onClick={() => { /* Forgot password route to be implemented */ }} style={{ position: "absolute", right: "0", top: "50%", transform: "translateY(-50%)", fontSize: "0.875rem", padding: 0, background: "none", border: "none", cursor: "pointer" }}>Forgot?</button>
          </div>
          <button className="gold-btn" type="submit" disabled={isLoading}>Sign In</button>
        </form>

        <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button type="button" className="gold-btn" onClick={googleLogin} disabled={!googleEnabled} title={!googleEnabled ? "Google sign-in coming soon" : "Continue with Google"} style={{ width: "100%", marginBottom: "0.75rem" }}>
            {googleEnabled ? "Continue with Google" : "Google sign-in coming soon"}
          </button>
          <button type="button" className="gold-link" onClick={magicLink} style={{ display: "block", textAlign: "center", width: "100%", fontSize: "0.875rem" }}>Or use magic link</button>
        </div>

        <p className="muted" style={{ marginTop: "2rem" }}>New to Community Collective? <Link href="/signup" className="gold-link">Create your account</Link> — it's instant.</p>

        {!googleEnabled && <p className="muted">Google sign-in coming soon. Please use email login or magic link.</p>}
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
