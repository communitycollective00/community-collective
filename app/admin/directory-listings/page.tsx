"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

type Listing = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  is_verified: boolean | null;
};

const BLANK: Partial<Listing> = {
  slug: "", name: "", category: "", city: "", state: "",
  bio: "", website: "", phone: "", image_url: "",
  is_featured: false, is_verified: false,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function EmblemUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const supabase = getSupabaseClient();
      const ext = file.name.split(".").pop();
      const filename = `directory/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(filename, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("media").getPublicUrl(filename);
      onChange(data.publicUrl);
    } catch (e: any) {
      setErr("Upload failed. Try again.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", background: "#1a1408", border: "1px solid rgba(200,157,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {value ? <img src={value} alt="emblem" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#c9a84c", fontSize: 12 }}>No logo</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <div>
        <button type="button" className="gold-btn" onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ padding: "0.5rem 1rem", borderRadius: 10, cursor: "pointer" }}>
          {uploading ? "Uploading..." : value ? "Replace logo" : "Upload logo"}
        </button>
        {err && <p style={{ color: "#ff6b6b", fontSize: 12, margin: "6px 0 0" }}>{err}</p>}
      </div>
    </div>
  );
}

export default function AdminDirectoryListingsPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/directory-listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [editing, setEditing] = useState<Partial<Listing> | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: e } = await (supabase.from("directory_listings") as any)
        .select("id,slug,name,category,city,state,bio,website,phone,image_url,is_featured,is_verified")
        .order("name", { ascending: true });
      if (e) throw e;
      setListings(data || []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load listings.");
    }
  }

  useEffect(() => { if (!loading && isAdmin) load(); }, [loading, isAdmin]);

  async function save() {
    if (!editing) return;
    setStatus("Saving...");
    try {
      const supabase = getSupabaseClient();
      const row: any = {
        slug: editing.slug || slugify(editing.name || ""),
        name: editing.name,
        category: editing.category || null,
        city: editing.city || null,
        state: editing.state || null,
        bio: editing.bio || null,
        website: editing.website || null,
        phone: editing.phone || null,
        image_url: editing.image_url || null,
        is_featured: !!editing.is_featured,
        is_verified: !!editing.is_verified,
      };
      if (editing.id) row.id = editing.id;
      const { error: e } = await (supabase.from("directory_listings") as any)
        .upsert(row, { onConflict: "id" });
      if (e) throw e;
      setStatus("Saved.");
      setEditing(null);
      await load();
    } catch (e: any) {
      setStatus("Save failed: " + (e?.message ?? "unknown error"));
    }
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm("Delete this listing permanently?")) return;
    try {
      const supabase = getSupabaseClient();
      const { error: e } = await (supabase.from("directory_listings") as any).delete().eq("id", id);
      if (e) throw e;
      setEditing(null);
      await load();
    } catch (e: any) {
      setStatus("Delete failed: " + (e?.message ?? "unknown error"));
    }
  }

  const filtered = listings.filter((l) =>
    search === "" ? true :
    [l.name, l.category, l.city, l.slug].some((f) => (f || "").toLowerCase().includes(search.toLowerCase()))
  );

  const inputStyle = { width: "100%", padding: "0.7rem 0.9rem", borderRadius: 10, background: "rgba(15,12,8,0.6)", border: "1px solid rgba(200,157,53,0.25)", color: "#fff", marginTop: 4 } as const;
  const labelStyle = { fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block", marginTop: "1rem" } as const;

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1100, margin: "2rem auto" }}>
        <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Business Directory</h1>
        <p className="muted">Add, edit, and verify curated business listings. Fill in anything the URL pull missed.</p>

        {loading && <p className="muted">Loading...</p>}
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {isAdmin && !editing && (
          <>
            <div style={{ display: "flex", gap: 10, margin: "1.25rem 0", flexWrap: "wrap" }}>
              <input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, flex: 1, marginTop: 0, minWidth: 220 }} />
              <button className="gold-btn" onClick={() => { setEditing({ ...BLANK }); setStatus(""); }}
                style={{ padding: "0.7rem 1.2rem", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
                + New business
              </button>
            </div>
            {status && <p className="muted" style={{ marginBottom: "1rem" }}>{status}</p>}
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map((l) => (
                <button key={l.id} onClick={() => { setEditing(l); setStatus(""); }}
                  style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 1rem", borderRadius: 12, background: "rgba(15,12,8,0.5)", border: "1px solid rgba(200,157,53,0.15)", cursor: "pointer", color: "#fff" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#1a1408", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {l.image_url ? <img src={l.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#c9a84c" }}>{(l.name || "?")[0]}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{l.name} {l.is_verified ? "\u2713" : ""} {l.is_featured ? "\u2b50" : ""}</div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)" }}>{[l.category, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" \u00b7 ")}</div>
                  </div>
                  {(!l.phone || !l.image_url || !l.website) && (
                    <span style={{ fontSize: "0.72rem", color: "#e0a44a", border: "1px solid rgba(224,164,74,0.4)", borderRadius: 8, padding: "2px 8px" }}>needs info</span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && <p className="muted">No listings yet.</p>}
            </div>
          </>
        )}

        {isAdmin && editing && (
          <div style={{ marginTop: "1.5rem" }}>
            <h2 style={{ marginTop: 0 }}>{editing.id ? "Edit business" : "New business"}</h2>

            <label style={labelStyle}>Logo / emblem</label>
            <div style={{ marginTop: 6 }}>
              <EmblemUploader value={editing.image_url || ""} onChange={(url) => setEditing({ ...editing, image_url: url })} />
            </div>

            <label style={labelStyle}>Business name</label>
            <input style={inputStyle} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />

            <label style={labelStyle}>Category</label>
            <input style={inputStyle} value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Barber, Attorney, Restaurant..." />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              </div>
              <div style={{ width: 120 }}>
                <label style={labelStyle}>State</label>
                <input style={inputStyle} value={editing.state || ""} onChange={(e) => setEditing({ ...editing, state: e.target.value })} placeholder="IN" />
              </div>
            </div>

            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="(219) 555-1234" />

            <label style={labelStyle}>Website</label>
            <input style={inputStyle} value={editing.website || ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="https://..." />

            <label style={labelStyle}>Bio</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />

            <div style={{ display: "flex", gap: 20, marginTop: "1.25rem", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!editing.is_verified} onChange={(e) => setEditing({ ...editing, is_verified: e.target.checked })} />
                <span>Verified (confirmed with business)</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                <span>Featured</span>
              </label>
            </div>

            {status && <p style={{ marginTop: "1rem", color: status.startsWith("Save failed") ? "#ff6b6b" : "#9fe1cb" }}>{status}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: "1.5rem", flexWrap: "wrap" }}>
              <button className="gold-btn" onClick={save} style={{ padding: "0.7rem 1.4rem", borderRadius: 10, cursor: "pointer" }}>Save</button>
              <button onClick={() => { setEditing(null); setStatus(""); }} style={{ padding: "0.7rem 1.4rem", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>Cancel</button>
              {editing.id && (
                <button onClick={() => remove(editing.id)} style={{ padding: "0.7rem 1.4rem", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,107,107,0.5)", color: "#ff6b6b", marginLeft: "auto" }}>Delete</button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
