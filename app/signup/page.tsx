"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";
import { useRouter } from "next/navigation";

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) return "That email is already registered. Please log in instead.";
  if (lower.includes("invalid email")) return "Please enter a valid email address.";
  if (lower.includes("password")) return "Please use a stronger password and try again.";
  return "We couldn't create your account right now. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirmPassword: "" });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.username.trim()) return "Username is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (!form.confirmPassword) return "Please confirm your password.";
    if (form.password !== form.confirmPassword) return "Confirm password must match.";
    return "";
  };

  const signup = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError);
      return;
    }

    setIsSubmitting(true);
    setStatus("Creating your account...");
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        data: {
          full_name: form.fullName,
          username: form.username,
        },
      },
    });

    if (error) {
      setStatus(friendlyAuthError(error.message));
      setIsSubmitting(false);
      return;
    }

    if (!data.user) {
      setStatus("We couldn't finish creating your account. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const provisionResponse = await fetch("/api/profiles/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          email: form.email,
          full_name: form.fullName,
          username: form.username,
        }),
      });

      if (!provisionResponse.ok) {
        throw new Error("profile_provision_failed");
      }
    } catch {
      setStatus("We created your account, but couldn't complete setup yet. Please try again in a moment.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    if (!data.session) {
      router.push(`/signup/check-email?email=${encodeURIComponent(form.email)}`);
      return;
    }

    router.push("/onboarding");
  };

  const continueWithGoogle = async () => {
    const { error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (error) {
      if (error.message.toLowerCase().includes("provider") || error.message.toLowerCase().includes("oauth")) {
        setStatus("Google sign-in is being connected. Please use email signup for now.");
      } else {
        setStatus("Google sign-in is temporarily unavailable. Please use email signup for now.");
      }
    }
  };

  const sendMagicLink = async () => {
    setStatus("Sending magic link backup...");
    const { error } = await getSupabaseClient().auth.signInWithOtp({
      email: form.email,
      options: {
        data: { full_name: form.fullName, username: form.username, role: "member", is_approved: true },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setStatus(error ? "Could not send magic link right now. Please verify your email and try again." : "Magic link sent. Check your inbox.");
  };

  return <main className="premium-page"><AuthNavbar /><section className="premium-card"><h1>Member Signup</h1><p className="muted">Create your Community Collective member account.</p><form onSubmit={signup} className="premium-form">
    <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
    <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
    <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
    <input required type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
    <button className="gold-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Account"}</button>
  </form>
  <div className="quick-links"><button className="gold-btn" onClick={continueWithGoogle} disabled={!googleEnabled} title={!googleEnabled ? "Google sign-in is currently disabled." : "Continue with Google"}>Continue with Google</button><button className="gold-btn" onClick={sendMagicLink}>Send Magic Link (Backup)</button></div>
  {!googleEnabled && <p className="muted">Google sign-in is not enabled yet. Please use email signup or magic link.</p>}
  <p className="muted">Professional or brand? <Link className="gold-link" href="/apply">Apply to be featured</Link></p>
  {status && <p className="muted">{status}</p>}</section></main>;
}
