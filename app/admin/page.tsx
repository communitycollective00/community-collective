"use client";

import Link from "next/link";
import { useAdminGuard } from "../components/admin-guard";

export default function AdminDashboardPage() {
  const { loading, error, isAdmin } = useAdminGuard("/admin");

  return (
    <main className="premium-page">
      <section className="premium-card admin-card">
        <h1>Admin Dashboard</h1>
        <p className="muted">Manage submissions and platform content.</p>

        {loading ? <p className="muted">Checking admin access...</p> : null}
        {error ? <p className="status-error">{error}</p> : null}
        {!loading && !error && !isAdmin ? <p className="status-error">You do not have admin access.</p> : null}

        {isAdmin ? (
          <div className="quick-links">
            <Link className="gold-link" href="/admin/submissions">Submissions</Link>
            <Link className="gold-link" href="/admin/opportunities">Opportunities</Link>
            <Link className="gold-link" href="/admin/events">Events</Link>
            <Link className="gold-link" href="/admin/pathways">Pathways</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
