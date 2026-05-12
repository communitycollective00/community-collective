"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";

type SubmissionStatus = "pending" | "reviewed" | "contacted" | "approved" | "declined";

type ProfileRole = "admin" | "verified" | "community";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Submission[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          window.location.href = "/login?next=/admin/submissions";
          return;
        }

        const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if ((profile?.role as ProfileRole | undefined) !== "admin") {
          setIsAdmin(false);
          return;
        }

        setIsAdmin(true);

        const { data, error: queryError } = await (supabase.from("submissions") as any)
          .select("id,full_name,email,phone,business_name,industry,city,submission_type,description,status,created_at")
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;
        setItems(data ?? []);
      } catch (loadError: any) {
        setError(loadError?.message ?? "Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
