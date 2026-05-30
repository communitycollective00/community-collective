"use client";

import Link from "next/link";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminCompaniesPage() {
  const { loading, error, isAdmin } = useAdminGuard("/admin/companies");

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
        <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Dashboard
        </Link>

        <h1>Companies</h1>
        <p className="muted">Manage company and organization listings.</p>

        {loading && <p className="muted">Checking admin access...</p>}
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {isAdmin && (
          <div className="card" style={{ marginTop: "1rem", textAlign: "center", padding: "3rem" }}>
            <p style={{ fontSize: "3rem", margin: "0 0 1rem 0" }}>🏢</p>
            <h3>Company Management Shell</h3>
            <p className="muted">This section is a placeholder for company profile and organization content management.</p>
            <p style={{ fontSize: "0.9rem", color: "#d3c18e", marginTop: "1.5rem" }}>
              Planned features:
              <br />• Create and edit companies
              <br />• Link organizations to directory profiles
              <br />• Manage company approval status
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
