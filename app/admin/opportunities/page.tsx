"use client";

import Link from "next/link";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminOpportunitiesPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/opportunities");

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
            ← Back to Dashboard
          </Link>

          <h1>Opportunities</h1>
          <p className="muted">Create and manage opportunities for members</p>

          {loading && <p className="muted">Checking admin access...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {isAdmin && (
            <div className="card" style={{ marginTop: "1rem", textAlign: "center", padding: "3rem" }}>
              <p style={{ fontSize: "3rem", margin: "0 0 1rem 0" }}>💼</p>
              <h3>Opportunities Management</h3>
              <p className="muted">Placeholder for opportunities management interface.</p>
              <p style={{ fontSize: "0.9rem", color: "#d3c18e", marginTop: "1.5rem" }}>
                Features to implement:
                <br />
                • Create new opportunities
                <br />
                • Edit existing opportunities
                <br />
                • Delete opportunities
                <br />
                • Featured opportunities section
              </p>
            </div>
          )}
      </section>
    </main>
  );
}
