"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";

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
  created_at: string;
};

export default function SubmissionsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Submission[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          setError("You must be logged in to view submissions.");
          return;
        }

        const { data, error: queryError } = await (supabase.from("submissions") as any)
          .select("id,full_name,email,phone,business_name,industry,city,submission_type,description,created_at")
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

  return (
    <main className="premium-page">
      <section className="premium-card" style={{ maxWidth: "960px" }}>
        <h1>Submissions Dashboard</h1>
        <p className="muted">Newest submissions first.</p>

        {loading ? <p className="muted">Loading submissions...</p> : null}
        {error ? <p className="status-error">{error}</p> : null}

        {!loading && !error && items.length === 0 ? <p className="muted">No submissions yet.</p> : null}

        <div className="submissions-list">
          {items.map((item) => (
            <article key={item.id} className="submission-item">
              <h3>{item.full_name ?? "Unknown"}</h3>
              <p className="muted" style={{ marginTop: 0 }}>
                {item.email ?? "No email"} • {item.phone ?? "No phone"}
              </p>
              <p>
                <strong>Business:</strong> {item.business_name ?? "-"} | <strong>Industry:</strong> {item.industry ?? "-"} | <strong>City:</strong> {item.city ?? "-"}
              </p>
              <p>
                <strong>Type:</strong> {item.submission_type ?? "-"}
              </p>
              <p>{item.description ?? ""}</p>
              <p className="muted">{new Date(item.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
