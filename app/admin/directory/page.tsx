"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminDirectoryPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/directory");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error: fetchErr } = await supabase
          .from("profiles")
          .select("id,full_name,username,role,category,city,created_at")
          .or("role.eq.professional,role.eq.professional_pending")
          .order("created_at", { ascending: false })
          .limit(100);

        if (fetchErr) throw fetchErr;
        setProfiles(data || []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load directory.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, setError]);

  const filtered = profiles.filter((p) =>
    searchTerm === ""
      ? true
      : p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
            ← Back to Dashboard
          </Link>

          <h1>Directory</h1>
          <p className="muted">Browse and manage professional directory listings</p>

          {loading && <p className="muted">Loading directory...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {isAdmin && (
            <>
              <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                <input
                  type="text"
                  placeholder="Search by name, username, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#111",
                    border: "1px solid #4c3a18",
                    color: "#f8f3e7",
                    borderRadius: "8px",
                  }}
                />
              </div>

              {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                  <p className="muted">{searchTerm ? "No profiles match your search." : "No professionals in directory."}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                  {filtered.map((prof: any) => (
                    <div key={prof.id} className="card">
                      <h3 style={{ margin: "0 0 0.5rem 0" }}>{prof.full_name || prof.username}</h3>
                      <div className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                        @{prof.username}
                      </div>
                      <div style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                        {prof.category && <div className="muted">{prof.category}</div>}
                        {prof.city && <div className="muted">{prof.city}</div>}
                        <div className="muted">{prof.role}</div>
                      </div>
                      <Link
                        href={`/directory/${prof.username}`}
                        style={{
                          display: "inline-block",
                          color: "#f4cf70",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        View Profile →
                      </Link>
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
