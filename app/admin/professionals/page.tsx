"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminProfessionalsPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/professionals");
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error: fetchErr } = await supabase
          .from("profiles")
          .select("id,full_name,username,role,is_featured,created_at")
          .or("role.eq.professional,role.eq.professional_pending")
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;
        setProfessionals(data || []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load professionals.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, setError]);

  async function toggleFeatured(profId: string, currentStatus: boolean) {
    setUpdating(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateErr } = await (supabase.from("profiles") as any)
        .update({ is_featured: !currentStatus })
        .eq("id", profId);

      if (updateErr) throw updateErr;

      // Reload
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,username,role,is_featured,created_at")
        .or("role.eq.professional,role.eq.professional_pending")
        .order("created_at", { ascending: false });
      setProfessionals(data || []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to update featured status.");
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

          <h1>Featured Professionals</h1>
          <p className="muted">Curate and manage featured professional profiles</p>

          {loading && <p className="muted">Loading professionals...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {isAdmin && (
            <>
              {professionals.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
                  <p className="muted">No professionals found.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  {professionals.map((prof: any) => (
                    <div key={prof.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                        <div>
                          <h3 style={{ margin: "0 0 0.25rem 0" }}>{prof.full_name || prof.username}</h3>
                          <div className="muted" style={{ fontSize: "0.85rem" }}>{prof.role}</div>
                        </div>
                        {prof.is_featured && <div style={{ color: "#ffd700", fontSize: "1.2rem" }}>⭐</div>}
                      </div>
                      <div style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
                        <div className="muted">Added: {new Date(prof.created_at).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => toggleFeatured(prof.id, prof.is_featured)}
                        disabled={updating}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          background: prof.is_featured ? "#ff9800" : "#4caf50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        {prof.is_featured ? "✓ Featured - Click to unfeature" : "+ Feature"}
                      </button>
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
