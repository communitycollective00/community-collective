"use client";

import Link from "next/link";

export default function CreateLivePage() {
  return (
    <main className="premium-page">
      <section className="premium-card onboarding-card create-live-coming-soon">
        <h1>🔴 Live</h1>
        <p className="muted">Live conversations and event coverage are coming soon.</p>

        <div className="create-live-actions">
          <Link className="gold-btn" href="/create">Back to Create</Link>
          <Link className="gold-link" href="/create/video">Share a Video</Link>
        </div>
      </section>
    </main>
  );
}
