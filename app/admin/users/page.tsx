"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminUsersPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/users");
  const [users, setUsers] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error: fetchErr } = await supabase
          .from("profiles")
          .select("id,full_name,username,email,role,created_at")
          .order("created_at", { ascending: false })
          .limit(100);

        if (fetchErr) throw fetchErr;
        setUsers(data || []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load users.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, setError]);

  async function updateRole(userId: string, newRole: string) {
    setUpdating(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateErr } = await (supabase.from("profiles") as any).update({ role: newRole }).eq("id", userId);

      if (updateErr) throw updateErr;

      // Reload
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,username,email,role,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      setUsers(data || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update role.");
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

          <h1>Users & Roles</h1>
          <p className="muted">Manage user profiles and assign roles</p>

          {loading && <p className="muted">Loading users...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {isAdmin && (
            <>
              {users.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
                  <p className="muted">No users found.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #4c3a18" }}>
                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Name</th>
                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Username</th>
                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Email</th>
                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Role</th>
                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Joined</th>
                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: any) => (
                        <tr key={user.id} style={{ borderBottom: "1px solid #4c3a18" }}>
                          <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>{user.full_name || "—"}</td>
                          <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>@{user.username || "—"}</td>
                          <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>{user.email}</td>
                          <td style={{ padding: "0.75rem", fontSize: "0.9rem", color: "#f4cf70", fontWeight: 600 }}>
                            {user.role}
                          </td>
                          <td style={{ padding: "0.75rem", fontSize: "0.85rem", color: "#d3c18e" }}>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <select
                              value={user.role}
                              onChange={(e) => updateRole(user.id, e.target.value)}
                              disabled={updating}
                              style={{
                                background: "#111",
                                border: "1px solid #4c3a18",
                                color: "#f8f3e7",
                                borderRadius: "4px",
                                padding: "0.4rem",
                                fontSize: "0.85rem",
                              }}
                            >
                              <option value="public">Public</option>
                              <option value="professional_pending">Professional Pending</option>
                              <option value="professional">Professional</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
      </section>
    </main>
  );
}
