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
  status: SubmissionStatus | null;
  created_at: string;
};

type SubmissionDetail = {
  content: any;
};

export default function SubmissionsAdminPage() {
  const pageStartTime = typeof window !== "undefined" ? performance.now() : 0;
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/submissions");
  const [items, setItems] = useState<Submission[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [timings, setTimings] = useState<Record<string, number>>({});

  useEffect(() => {
    const mountTime = performance.now() - pageStartTime;
    console.log(`[SUBMISSIONS] Component mounted at T=${mountTime.toFixed(0)}ms, loading=${loading}, isAdmin=${isAdmin}`);

    async function load() {
      const guardFinishTime = performance.now() - pageStartTime;
      console.log(`[SUBMISSIONS] load() called at T=${guardFinishTime.toFixed(0)}ms: isAdmin=${isAdmin}`);
      
      if (!isAdmin) {
        console.log(`[SUBMISSIONS] load() returning early: isAdmin is false`);
        return;
      }
      setError(null);
      try {
        const queryStartTime = performance.now() - pageStartTime;
        console.log(`[SUBMISSIONS] Supabase query starting at T=${queryStartTime.toFixed(0)}ms`);
        
        const supabase = getSupabaseClient();
        const { data, error: queryError } = await (supabase.from("submissions") as any)
          .select("id,title,type,status,created_at")
          .order("created_at", { ascending: false })
          .limit(50);

        const queryEndTime = performance.now() - pageStartTime;
        const queryDuration = queryEndTime - queryStartTime;
        console.log(`[SUBMISSIONS] Query completed at T=${queryEndTime.toFixed(0)}ms (duration: ${queryDuration.toFixed(0)}ms), items=${data ? (data as any).length : 0}, error=${queryError ? queryError.message : "NULL"}`);

        if (queryError) throw queryError;
        console.log(`[SUBMISSIONS] Setting items state`);
        setItems(data ?? []);
        setTimings({
          guardFinish: guardFinishTime,
          queryStart: queryStartTime,
          queryEnd: queryEndTime,
          queryDuration: queryDuration,
        });
      } catch (loadError: any) {
        console.error(`[SUBMISSIONS] load error:`, loadError);
        setError(loadError?.message ?? "Failed to load submissions.");
      }
    }

    if (!loading && isAdmin) {
      console.log(`[SUBMISSIONS] Conditions met at T=${(performance.now() - pageStartTime).toFixed(0)}ms: calling load()`);
      load();
    } else {
      console.log(`[SUBMISSIONS] Conditions not met: loading=${loading}, isAdmin=${isAdmin}`);
    }
  }, [loading, isAdmin, setError, pageStartTime]);

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

  async function loadSubmissionDetails(id: string) {
    if (expandedId === id && expandedDetail) {
      setExpandedId(id);
      return;
    }

    setDetailLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: detailError } = await (supabase.from("submissions") as any)
        .select("content")
        .eq("id", id)
        .maybeSingle();

      if (detailError) throw detailError;
      setExpandedId(id);
      setExpandedDetail(data ?? null);
    } catch (detailError: any) {
      console.error("[SUBMISSIONS] detail load error:", detailError);
      setError(detailError?.message ?? "Failed to load submission details.");
    } finally {
      setDetailLoading(false);
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

  // Log render timing
  useEffect(() => {
    const renderTime = performance.now() - pageStartTime;
    console.log(`[SUBMISSIONS] Page rendered at T=${renderTime.toFixed(0)}ms, items count=${items.length}, timings=`, timings);
  }, [items, pageStartTime, timings]);

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
              const isExpanded = expandedId === item.id;
              const details = isExpanded ? parseSubmissionContent(expandedDetail?.content) : null;

              return (
                <article key={item.id} className="submission-item">
                  <div className="submission-grid">
                    <p><strong>Title:</strong> {item.title || "Untitled submission"}</p>
                    <p><strong>Type:</strong> {item.type || "N/A"}</p>
                    <p><strong>Status:</strong> {item.status || "pending"}</p>
                    <p><strong>Submitted:</strong> {new Date(item.created_at).toLocaleString()}</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
                    <button
                      type="button"
                      className="gold-btn"
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedId(null);
                        } else {
                          loadSubmissionDetails(item.id);
                        }
                      }}
                    >
                      {isExpanded ? "Hide details" : "View details"}
                    </button>
                    {detailLoading && isExpanded ? <span className="muted">Loading details...</span> : null}
                  </div>

                  {isExpanded ? (
                    <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "rgba(31, 26, 15, 0.9)", borderRadius: "10px" }}>
                      <p><strong>Full Name:</strong> {details?.professional_name ?? item.title ?? "-"}</p>
                      <p><strong>Email Address:</strong> {details?.user_email ?? details?.email ?? "-"}</p>
                      <p><strong>Phone Number:</strong> {details?.phone ?? "-"}</p>
                      <p><strong>City:</strong> {details?.city ?? "-"}</p>
                      <p><strong>State:</strong> {details?.state ?? "-"}</p>
                      <p><strong>Member Type:</strong> {details?.category ?? item.type ?? "-"}</p>
                      <p><strong>Profession:</strong> {details?.industry ?? details?.credentials ?? "-"}</p>
                      <p><strong>Organization / Business:</strong> {details?.location ?? details?.organization ?? "-"}</p>
                      <p><strong>Website / Social Media:</strong> {details?.website ?? "-"}</p>
                      <p><strong>Why should the Community know about you?</strong> {details?.featured_reason ?? details?.description ?? "-"}</p>
                    </div>
                  ) : null}

                  <label className="status-control" style={{ marginTop: "1rem" }}>
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
