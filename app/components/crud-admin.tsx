"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { useAdminGuard } from "./admin-guard";

type Row = Record<string, any> & { id: string };

export default function CrudAdmin({ table, title }: { table: string; title: string }) {
  const { loading, error, isAdmin, setError } = useAdminGuard(`/admin/${table}`);
  const [items, setItems] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "" });

  async function loadRows() {
    try {
      const supabase = getSupabaseClient();
      const { data, error: queryError } = await (supabase.from(table) as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      setItems(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? `Failed to load ${table}.`);
    }
  }

  useEffect(() => {
    if (!loading && isAdmin) loadRows();
  }, [loading, isAdmin]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: "active",
      };
      const { error: createError } = await (supabase.from(table) as any).insert(payload);
      if (createError) throw createError;
      setDraft({ title: "", description: "" });
      await loadRows();
    } catch (e: any) {
      setError(e?.message ?? `Failed to create in ${table}.`);
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(id: string, patch: Record<string, any>) {
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await (supabase.from(table) as any)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (updateError) throw updateError;
      setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    } catch (e: any) {
      setError(e?.message ?? `Failed to update ${table} item.`);
    }
  }

  async function deleteItem(id: string) {
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: deleteError } = await (supabase.from(table) as any).delete().eq("id", id);
      if (deleteError) throw deleteError;
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (e: any) {
      setError(e?.message ?? `Failed to delete ${table} item.`);
    }
  }

  return (
    <main className="premium-page">
      <section className="premium-card admin-card" style={{ maxWidth: "1120px" }}>
        <h1>{title}</h1>
        <p className="muted">Create, edit, and remove records.</p>
        {loading ? <p className="muted">Checking admin access...</p> : null}
        {error ? <p className="status-error">{error}</p> : null}
        {!loading && !error && !isAdmin ? <p className="status-error">You do not have admin access.</p> : null}

        {isAdmin ? (
          <>
            <form className="premium-form" onSubmit={createItem}>
              <input placeholder="Title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} required />
              <textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={3} />
              <button className="gold-btn" disabled={saving}>{saving ? "Saving..." : `Add ${title.slice(0, -1)}`}</button>
            </form>

            <div className="submissions-list" style={{ marginTop: "1rem" }}>
              {items.map((item) => (
                <article key={item.id} className="submission-item">
                  <input value={item.title ?? ""} onChange={(e) => updateItem(item.id, { title: e.target.value })} />
                  <textarea value={item.description ?? ""} onChange={(e) => updateItem(item.id, { description: e.target.value })} rows={3} style={{ marginTop: "0.5rem" }} />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <select value={item.status ?? "active"} onChange={(e) => updateItem(item.id, { status: e.target.value })}>
                      <option value="active">active</option>
                      <option value="draft">draft</option>
                      <option value="archived">archived</option>
                    </select>
                    <button className="gold-btn" type="button" onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
