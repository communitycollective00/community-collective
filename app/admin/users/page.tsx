"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";
import { useAuth } from "../../components/auth-provider";

type RoleOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const PRIMARY_ADMIN_USER_ID = "fc2ac274-3e17-4d3b-ab61-3534f1526881";

const ROLE_OPTIONS: RoleOption[] = [
  { value: "public", label: "Public" },
  { value: "member", label: "Member" },
  { value: "professional", label: "Professional" },
  { value: "admin", label: "Admin" },
];

function normalizeDisplayRole(role: string | null | undefined) {
  if (!role || role === "public") return "Member";
  if (role === "professional_pending") return "Professional (Pending)";
  if (role === "professional") return "Professional";
  if (role === "admin") return "Admin";
  return role;
}

export default function AdminUsersPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/users");
  const { user } = useAuth();
  const isPrimaryAdmin = user?.id === PRIMARY_ADMIN_USER_ID;

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalUsers, setTotalUsers] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalUsers / pageSize)), [totalUsers, pageSize]);

  useEffect(() => {
    async function loadUsers() {
      if (!isAdmin) return;
      setError(null);
      setIsLoadingUsers(true);

      try {
        const supabase = getSupabaseClient();
        const query = supabase.from("profiles").select("id,full_name,username,email,role,created_at", { count: "exact" });

        if (search.trim()) {
          const term = `%${search.trim()}%`;
          query.or(`full_name.ilike.${term},username.ilike.${term},email.ilike.${term}`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, error: fetchErr, count } = await query.order("created_at", { ascending: false }).range(from, to);

        if (fetchErr) throw fetchErr;
        setUsers(data || []);
        setTotalUsers(count ?? 0);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load users.");
      } finally {
        setIsLoadingUsers(false);
      }
    }

    if (!loading && isAdmin) {
      loadUsers();
    }
  }, [loading, isAdmin, page, pageSize, search, setError]);

  const getRoleOptionsForRow = (userRole: string) => {
    if (isPrimaryAdmin) {
      return ROLE_OPTIONS;
    }

    const filteredOptions = ROLE_OPTIONS.filter((option) => option.value !== "admin");

    if (userRole === "admin") {
      return [{ value: "admin", label: "Admin", disabled: true }, ...filteredOptions];
    }

    return filteredOptions;
  };

  async function updateRole(userId: string, currentRole: string, newRole: string) {
    if (currentRole === newRole) return;

    if (!isPrimaryAdmin && newRole === "admin") {
      setError("Only the primary admin can assign admin access.");
      return;
    }

    if (!isPrimaryAdmin && currentRole === "admin" && newRole !== "admin") {
      setError("Only the primary admin can demote admin access.");
      return;
    }

    if (userId === PRIMARY_ADMIN_USER_ID && currentRole === "admin" && newRole !== "admin") {
      setError("Primary Admin account cannot be demoted.");
      return;
    }

    const confirmMessage = `Change this user from ${normalizeDisplayRole(currentRole)} to ${normalizeDisplayRole(newRole)}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      if (currentRole === "admin" && newRole !== "admin") {
        const { count: adminCount, error: adminCountErr } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");

        if (adminCountErr) throw adminCountErr;
        if ((adminCount ?? 0) <= 1) {
          setError("Cannot remove the final admin account. Add another admin before changing this user.");
          return;
        }
      }

      const targetRole = newRole === "member" ? "public" : newRole;
      const { error: updateErr } = await (supabase.from("profiles") as any).update({ role: targetRole }).eq("id", userId);
      if (updateErr) throw updateErr;

      // Refresh the current page after a successful update.
      const term = `%${search.trim()}%`;
      const query = supabase.from("profiles").select("id,full_name,username,email,role,created_at", { count: "exact" });
      if (search.trim()) {
        query.or(`full_name.ilike.${term},username.ilike.${term},email.ilike.${term}`);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error: reloadErr, count } = await query.order("created_at", { ascending: false }).range(from, to);
      if (reloadErr) throw reloadErr;
      setUsers(data || []);
      setTotalUsers(count ?? 0);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update role.");
    } finally {
      setUpdating(false);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1400, margin: "2rem auto" }}>
        <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          ← Back to Dashboard
        </Link>

        <h1>Users & Roles</h1>
        <p className="muted">Search, review, and update user access for the community.</p>

        {loading && <p className="muted">Loading users...</p>}
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {isAdmin && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.5rem", alignItems: "center" }}>
              <form onSubmit={handleSearchSubmit} style={{ flex: "1 1 300px", display: "flex", gap: "0.5rem" }}>
                <input
                  type="search"
                  placeholder="Search name, username, or email"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "0.75rem 1rem",
                    borderRadius: "999px",
                    border: "1px solid #4c3a18",
                    background: "#111",
                    color: "#f8f3e7",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "999px",
                    border: "1px solid #d3c18e",
                    background: "#d3c18e",
                    color: "#111",
                    cursor: "pointer",
                  }}
                >
                  Search
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="muted">Page {page} of {totalPages}</span>
                <button
                  disabled={page <= 1 || isLoadingUsers}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  style={{
                    padding: "0.6rem 0.9rem",
                    borderRadius: "999px",
                    border: "1px solid #4c3a18",
                    background: "transparent",
                    color: "#f8f3e7",
                    cursor: page <= 1 || isLoadingUsers ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages || isLoadingUsers}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  style={{
                    padding: "0.6rem 0.9rem",
                    borderRadius: "999px",
                    border: "1px solid #4c3a18",
                    background: "transparent",
                    color: "#f8f3e7",
                    cursor: page >= totalPages || isLoadingUsers ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1.5rem" }}>
                <p className="muted">Fetching users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1.5rem" }}>
                <p className="muted">No users found.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "1.5rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #4c3a18" }}>
                      <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Email</th>
                      <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Role</th>
                      <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Joined</th>
                      <th style={{ textAlign: "left", padding: "0.75rem", color: "#d3c18e", fontSize: "0.85rem" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} style={{ borderBottom: "1px solid #4c3a18" }}>
                        <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                          {user.full_name || user.username || "—"}
                          {user.id === PRIMARY_ADMIN_USER_ID ? (
                            <span
                              style={{
                                display: "inline-block",
                                marginLeft: "0.5rem",
                                padding: "0.15rem 0.5rem",
                                background: "#d3c18e",
                                color: "#111",
                                borderRadius: "999px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              Primary Admin
                            </span>
                          ) : null}
                        </td>
                        <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>{user.email || "—"}</td>
                        <td style={{ padding: "0.75rem", fontSize: "0.9rem", color: "#f4cf70", fontWeight: 600 }}>
                          {normalizeDisplayRole(user.role)}
                        </td>
                        <td style={{ padding: "0.75rem", fontSize: "0.85rem", color: "#d3c18e" }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "0.75rem", minWidth: "190px" }}>
                          <select
                            value={user.role === "public" ? "member" : user.role}
                            onChange={(e) => updateRole(user.id, user.role, e.target.value)}
                            disabled={
                              updating ||
                              user.id === PRIMARY_ADMIN_USER_ID ||
                              (!isPrimaryAdmin && user.role === "admin")
                            }
                            style={{
                              width: "100%",
                              background: "#111",
                              border: "1px solid #4c3a18",
                              color: "#f8f3e7",
                              borderRadius: "4px",
                              padding: "0.4rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            {getRoleOptionsForRow(user.role).map((option) => (
                              <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                              </option>
                            ))}
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
