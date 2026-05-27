"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminApplicationsPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();
        let query = supabase.from("applications").select("*").order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("status", filter);
        }

        const { data, error: fetchErr } = await query;

        if (fetchErr) throw fetchErr;
        setApplications(data || []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load applications.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, filter, setError]);

  async function updateStatus(appId: string, newStatus: string) {
    setUpdating(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateErr } = await (supabase.from("applications") as any)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", appId);

      if (updateErr) throw updateErr;

      // Reload applications
      const { data } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      setApplications(data || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update application.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
            ← Back to Dashboard
          </Link>

          <h1>Manage Applications</h1>
          <p className="muted">Review and approve/reject member access applications</p>

          {loading && <p className="muted">Loading applications...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {isAdmin && (
            <>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                {["pending", "approved", "rejected", "all"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: filter === status ? "#f4cf70" : "rgba(200,157,53,0.1)",
                      color: filter === status ? "#1c1508" : "#d3c18e",
                      border: "1px solid " + (filter === status ? "#f4cf70" : "rgba(200,157,53,0.2)"),
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {applications.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <p className="muted">No applications found.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {applications.map((app: any) => (
                    <div key={app.id} className="card" style={{ padding: "1.5rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start" }}>
                        <div>
                          <h3 style={{ margin: "0 0 0.5rem 0" }}>{app.full_name}</h3>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.9rem" }}>
                            <div>
                              <strong>Email:</strong>
                              <div className="muted">{app.email}</div>
                            </div>
                            <div>
                              <strong>Phone:</strong>
                              <div className="muted">{app.phone || "Not provided"}</div>
                            </div>
                            <div>
                              <strong>Location:</strong>
                              <div className="muted">{app.city}, {app.state}</div>
                            </div>
                            <div>
                              <strong>Type:</strong>
                              <div className="muted">{app.application_type}</div>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <strong>Industry:</strong>
                              <div className="muted">{app.industry}</div>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <strong>Reason:</strong>
                              <div className="muted">{app.reason}</div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "4px",
                              background: app.status === "pending" ? "#ff9800" : app.status === "approved" ? "#4caf50" : "#f44336",
                              color: "#fff",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              textAlign: "center",
                            }}
                          >
                            {app.status.toUpperCase()}
                          </div>
                          <button
                            onClick={() => updateStatus(app.id, "approved")}
                            disabled={updating}
                            style={{
                              padding: "0.5rem 1rem",
                              background: "#4caf50",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, "rejected")}
                            disabled={updating}
                            style={{
                              padding: "0.5rem 1rem",
                              background: "#f44336",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
      </section>
    </main>
  );
}

