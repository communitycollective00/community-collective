"use client";

import Link from "next/link";
import { useAuth } from "../components/auth-provider";
import { isProfessionalRole } from "../../lib/roles";
import { useEffect, useState } from "react";

type ProfileData = { role: string | null };

export default function CreatePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { profile: providerProfile, role, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (providerProfile) {
      setProfile({ role: providerProfile.role });
    } else if (!authLoading) {
      setProfile({ role });
    }
  }, [providerProfile, role, authLoading]);

  const canPublish = isProfessionalRole(profile?.role) || profile?.role === "admin";

  if (!user) {
    return (
      <main className="premium-page">
        <section className="premium-card onboarding-card">
          <h1>Sign in to create</h1>
          <p className="muted">You need to be signed in to create and share content.</p>
          <div className="quick-links">
            <a className="gold-link" href="/login">Login</a>
            <a className="gold-link" href="/signup">Sign up</a>
          </div>
        </section>
      </main>
    );
  }

  if (!canPublish) {
    return (
      <main className="premium-page">
        <section className="premium-card onboarding-card">
          <h1>Access required</h1>
          <p className="muted">Only verified professionals and admins can create public content. If you are a professional applicant, submit an application first.</p>
          <div className="quick-links">
            <a className="gold-link" href="/apply">Apply to be featured</a>
            <a className="gold-link" href="/directory">Browse professionals</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page create-page">
      <section className="create-hero">
        <h1>Create</h1>
        <p className="muted">Share what you know. Build what matters.</p>
      </section>

      <section className="create-cards-grid">
        <Link href="/create/photo" className="create-action-card">
          <div className="card-icon">📷</div>
          <h2>Photo</h2>
          <p>Share an image with context</p>
        </Link>

        <Link href="/create/video" className="create-action-card">
          <div className="card-icon">🎥</div>
          <h2>Video</h2>
          <p>Share a video link</p>
        </Link>

        <Link href="/create/live" className="create-action-card disabled">
          <div className="card-icon">🔴</div>
          <h2>Live</h2>
          <p>Coming soon</p>
        </Link>

        <Link href="/create/opportunity" className="create-action-card">
          <div className="card-icon">💼</div>
          <h2>Opportunity</h2>
          <p>Post a job or grant</p>
        </Link>
      </section>
    </main>
  );
}
