"use client";

import Link from "next/link";

export default function CreateLivePage() {
  return (
    <main className="premium-page">
      <section className="premium-card onboarding-card">
        <h1>🔴 Live Streaming</h1>
        <p className="muted">Live streaming feature is coming soon.</p>
        <div className="quick-links">
          <Link className="gold-link" href="/create">Back to Create</Link>
        </div>
      </section>
    </main>
  );
}
