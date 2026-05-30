"use client";

import Link from "next/link";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminVoicesPage() {
  const { loading, error, isAdmin } = useAdminGuard("/admin/voices");

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
        <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Dashboard
        </Link>

        <h1>Voices</h1>
        <p className="muted">Manage creator stories, editorial content, and voice assets.</p>

        {loading && <p className="muted">Checking admin access...</p>}
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {isAdmin && (
          <div className="card" style={{ marginTop: "1rem", textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "3rem", margin: "0 0 1rem 0" }}>🗣️</p>
            <h3>Voices Management Shell</h3>
            <p className="muted">This section is a placeholder for stories and creator voice content.</p>
            <p style={{ fontSize: "0.9rem", color: "#d3c18e", marginTop: "1.5rem" }}>
              Planned features:
              <br />• Curate voice pieces and narratives
              <br />• Publish and archive editorial content
              <br />• Flag featured voices for promotion
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
