"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { useAdminGuard } from "../components/admin-guard";

export default function AdminDashboardPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin");
  const [totals, setTotals] = useState({ users: 0, pending: 0, submissions: 0 });
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();

        // total users (count)
        const profilesCountRes = await (supabase.from("profiles") as any).select("id", { count: "exact", head: true });
        const users = (profilesCountRes?.count as number) || 0;

        // pending applications
        const pendingRes = await (supabase.from("applications") as any).select("id", { count: "exact", head: true }).eq("status", "pending");
        const pending = (pendingRes?.count as number) || 0;

        // recent applications
        const { data: apps } = await (supabase.from("applications") as any)
          .select("id,full_name,email,application_type,status,created_at")
          .order("created_at", { ascending: false })
          .limit(6);

        // recent profiles
        const { data: profiles } = await (supabase.from("profiles") as any)
          .select("id,full_name,username,email,role,created_at")
          .order("created_at", { ascending: false })
          .limit(6);

        setTotals({ users, pending, submissions: apps?.length || 0 });
        setRecentApps(apps || []);
        setRecentProfiles(profiles || []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load admin data.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, setError]);

  return (
    <main className="premium-page">
      <section className="premium-card admin-card" style={{ maxWidth: 1120 }}>
        <h1>Admin Dashboard</h1>
        <p className="muted">Overview · quick review · platform links</p>

        {loading ? <p className="muted">Checking admin access...</p> : null}
        {error ? <p className="status-error">{error}</p> : null}
        {!loading && !error && !isAdmin ? <p className="status-error">You do not have admin access.</p> : null}

        {isAdmin ? (
          <>
            <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div className="card" style={{ padding: 14, minWidth: 160 }}>
                <div style={{ fontSize: 12, color: "#d3c18e", fontWeight: 700 }}>Total users</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f4cf70" }}>{totals.users}</div>
              </div>
              <div className="card" style={{ padding: 14, minWidth: 160 }}>
                <div style={{ fontSize: 12, color: "#d3c18e", fontWeight: 700 }}>Pending applications</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f4cf70" }}>{totals.pending}</div>
              </div>
              <div className="card" style={{ padding: 14, minWidth: 160 }}>
                <div style={{ fontSize: 12, color: "#d3c18e", fontWeight: 700 }}>Recent submissions</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f4cf70" }}>{totals.submissions}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Recent applications</h3>
                {recentApps.length === 0 ? (
                  <p className="muted">No recent applications.</p>
                ) : (
                  <div className="submissions-list">
                    {recentApps.map((a: any) => (
                      <article key={a.id} className="submission-item">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <strong>{a.full_name}</strong>
                            <div className="muted">{a.email} • {a.application_type}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="muted">{new Date(a.created_at).toLocaleString()}</div>
                            <div style={{ marginTop: 8 }}><Link className="gold-link" href="/admin/submissions">Review</Link></div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ marginTop: 0 }}>Recent profiles</h3>
                {recentProfiles.length === 0 ? (
                  <p className="muted">No recent profiles.</p>
                ) : (
                  <div className="submissions-list">
                    {recentProfiles.map((p: any) => (
                      <article key={p.id} className="submission-item">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <strong>{p.full_name || p.username || p.email}</strong>
                            <div className="muted">{p.role || "public"}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div className="muted">{new Date(p.created_at).toLocaleString()}</div>
                            <div style={{ marginTop: 8 }}><Link className="gold-link" href={`/profile`}>Open</Link></div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 18 }} className="quick-links">
              <Link className="gold-link" href="/admin/applications">Applications</Link>
              <Link className="gold-link" href="/admin/submissions">Submissions</Link>
              <Link className="gold-link" href="/admin/opportunities">Opportunities</Link>
              <Link className="gold-link" href="/admin/events">Events</Link>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
