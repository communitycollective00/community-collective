"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

type SubmissionStatus = "pending" | "reviewed" | "contacted" | "approved" | "declined";


const STATUS_OPTIONS: SubmissionStatus[] = ["pending", "reviewed", "contacted", "approved", "declined"];

type Submission = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  industry: string | null;
  city: string | null;
  submission_type: string | null;
  description: string | null;
  status: SubmissionStatus | null;
  created_at: string;
};

export default function SubmissionsAdminPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/submissions");
  const [items, setItems] = useState<Submission[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error: queryError } = await (supabase.from("submissions") as any)
          .select("id,full_name,email,phone,business_name,industry,city,submission_type,description,status,created_at")
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;
        setItems(data ?? []);
      } catch (loadError: any) {
        setError(loadError?.message ?? "Failed to load submissions.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, setError]);

  async function updateStatus(id: string, status: SubmissionStatus) {
    if (!isAdmin) return;

    setSavingId(id);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await (supabase.from("submissions") as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch (statusError: any) {
      setError(statusError?.message ?? "Failed to update status.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="premium-page">
      <section className="premium-card admin-card" style={{ maxWidth: "1120px" }}>
        <h1>Submissions Dashboard</h1>
        <p className="muted">All submissions, newest first.</p>
        <div className="quick-links"><Link className="gold-link" href="/admin">Back to Admin Dashboard</Link></div>

        {loading ? <p className="muted">Loading submissions...</p> : null}
        {error ? <p className="status-error">{error}</p> : null}

        {!loading && !error && !isAdmin ? <p className="status-error">You do not have admin access.</p> : null}

        {!loading && !error && isAdmin && items.length === 0 ? <p className="muted">No submissions yet.</p> : null}

        {isAdmin ? (
          <div className="submissions-list">
            {items.map((item) => (
              <article key={item.id} className="submission-item">
                <div className="submission-grid">
                  <p><strong>Full name:</strong> {item.full_name ?? "-"}</p>
                  <p><strong>Email:</strong> {item.email ?? "-"}</p>
                  <p><strong>Phone:</strong> {item.phone ?? "-"}</p>
                  <p><strong>Business:</strong> {item.business_name ?? "-"}</p>
                  <p><strong>Industry:</strong> {item.industry ?? "-"}</p>
                  <p><strong>City:</strong> {item.city ?? "-"}</p>
                  <p><strong>Type:</strong> {item.submission_type ?? "-"}</p>
                  <p><strong>Created:</strong> {new Date(item.created_at).toLocaleString()}</p>
                </div>
                <p><strong>Description:</strong> {item.description ?? "-"}</p>

                <label className="status-control">
                  <strong>Status:</strong>
                  <select
                    value={item.status ?? "pending"}
                    onChange={(e) => updateStatus(item.id, e.target.value as SubmissionStatus)}
                    disabled={savingId === item.id}
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>{statusOption}</option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
