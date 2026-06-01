"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

type SubmissionStatus = "pending" | "approved" | "rejected";

const STATUS_OPTIONS: SubmissionStatus[] = ["pending", "approved", "rejected"];

type Submission = {
  id: string;
  title: string | null;
  type: string | null;
  content: any;
  status: SubmissionStatus | null;
  created_at: string;
};

export default function SubmissionsAdminPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/submissions");
  const [items, setItems] = useState<Submission[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[SUBMISSIONS] useEffect: loading=${loading}, isAdmin=${isAdmin}`);

    async function load() {
      console.log(`[SUBMISSIONS] load() called: isAdmin=${isAdmin}`);
      if (!isAdmin) {
        console.log(`[SUBMISSIONS] load() returning early: isAdmin is false`);
        return;
      }
      setError(null);
      try {
        const supabase = getSupabaseClient();
        console.log(`[SUBMISSIONS] fetching submissions from database`);
        const { data, error: queryError } = await (supabase.from("submissions") as any)
          .select("id,title,type,content,status,created_at")
          .order("created_at", { ascending: false });

        console.log(`[SUBMISSIONS] query result: data=${data ? `${(data as any).length} items` : "NULL"}, error=${queryError ? queryError.message : "NULL"}`);

        if (queryError) throw queryError;
        console.log(`[SUBMISSIONS] setting items state to:`, data ?? []);
        setItems(data ?? []);
      } catch (loadError: any) {
        console.error(`[SUBMISSIONS] load error:`, loadError);
        setError(loadError?.message ?? "Failed to load submissions.");
      }
    }

    if (!loading && isAdmin) {
      console.log(`[SUBMISSIONS] conditions met: calling load()`);
      load();
    } else {
      console.log(`[SUBMISSIONS] conditions not met: loading=${loading}, isAdmin=${isAdmin}`);
    }
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

  function parseSubmissionContent(content: unknown) {
    if (!content) return {};
    if (typeof content === "object") return content;

    try {
      return JSON.parse(String(content));
    } catch {
      return {};
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

        {!loading && !error && isAdmin && items.length === 0 ? (
          <p className="muted">No submissions yet. (items.length={items.length})</p>
        ) : null}

        {isAdmin ? (
          <div className="submissions-list">
            {items.map((item) => {
              const details = parseSubmissionContent(item.content);
              return (
                <article key={item.id} className="submission-item">
                  <div className="submission-grid">
                    <p><strong>Full Name:</strong> {details.professional_name ?? item.title ?? "-"}</p>
                    <p><strong>Email Address:</strong> {details.user_email ?? details.email ?? "-"}</p>
                    <p><strong>Phone Number:</strong> {details.phone ?? "-"}</p>
                    <p><strong>City:</strong> {details.city ?? "-"}</p>
                    <p><strong>State:</strong> {details.state ?? "-"}</p>
                    <p><strong>Member Type:</strong> {details.category ?? item.type ?? "-"}</p>
                    <p><strong>Profession:</strong> {details.industry ?? details.credentials ?? "-"}</p>
                    <p><strong>Organization / Business:</strong> {details.location ?? details.organization ?? "-"}</p>
                    <p><strong>Submitted:</strong> {new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <p><strong>Website / Social Media:</strong> {details.website ?? "-"}</p>
                  <p><strong>Why should the Community know about you?</strong> {details.featured_reason ?? details.description ?? "-"}</p>

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
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
