"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";
import VideoEmbed from "../../components/video-embed";

type Item = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  sort_order: number;
};

function guessType(url: string): string {
  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(url)) return "image";
  return "video";
}

export default function FeaturedAdmin() {
  const { loading: guardLoading, isAdmin } = useAdminGuard("/admin/featured");
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  async function loadAll() {
    try {
      const supabase = getSupabaseClient();
      const { data: slot } = await (supabase.from("featured_slot") as any)
        .select("*").eq("id", "home").limit(1);
      const slotRow = Array.isArray(slot) ? slot[0] : slot;
      if (slotRow) {
        setTitle(slotRow.title || "");
        setIsActive(!!slotRow.is_active);
      }
      const { data: its } = await (supabase.from("featured_items") as any)
        .select("*").eq("slot_id", "home").order("sort_order");
      setItems((its || []) as Item[]);
    } catch (e) {
      console.error("Load failed:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (guardLoading || !isAdmin) return;
    loadAll();
  }, [guardLoading, isAdmin]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setStatus("Uploading " + files.length + " file(s)…");
    try {
      const supabase = getSupabaseClient();
      const sessionResp = await supabase.auth.getSession();
      const userId = sessionResp?.data?.session?.user?.id;
      if (!userId) { setStatus("Unable to identify your session."); setUploading(false); return; }

      let nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
      const newRows: any[] = [];

      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const ext = (file.name.split(".").pop() || "mp4").replace(/[^a-z0-9]/gi, "");
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: true });
        if (upErr) { setStatus("Upload failed on " + file.name); continue; }
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
        const publicUrl = urlData?.publicUrl || "";
        if (!publicUrl) continue;
        const mtype = file.type.startsWith("image/") ? "image" : "video";
        newRows.push({ slot_id: "home", media_url: publicUrl, media_type: mtype, caption: null, sort_order: nextOrder++ });
      }

      if (newRows.length) {
        const { data: inserted, error: insErr } = await (supabase.from("featured_items") as any).insert(newRows).select();
        if (insErr) { setStatus("Saved files but DB insert failed: " + insErr.message); }
        else { setItems((prev) => [...prev, ...(inserted as Item[])]); setStatus("Added " + inserted.length + " item(s)."); }
      } else {
        setStatus("No files were added.");
      }
    } catch (e: any) {
      setStatus("Upload error: " + (e?.message || "unknown"));
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function addLink() {
    const url = linkInput.trim();
    if (!url) return;
    try {
      const supabase = getSupabaseClient();
      const nextOrder = items.length ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
      const row = { slot_id: "home", media_url: url, media_type: guessType(url), caption: null, sort_order: nextOrder };
      const { data: inserted, error } = await (supabase.from("featured_items") as any).insert(row).select();
      if (error) { setStatus("Add link failed: " + error.message); return; }
      const newItem = (Array.isArray(inserted) ? inserted[0] : inserted) as Item;
      setItems((prev) => [...prev, newItem]);
      setLinkInput("");
      setStatus("Link added.");
    } catch (e: any) {
      setStatus("Add link error: " + (e?.message || "unknown"));
    }
  }

  async function removeItem(id: string) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await (supabase.from("featured_items") as any).delete().eq("id", id);
      if (error) { setStatus("Remove failed: " + error.message); return; }
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setStatus("Remove error: " + (e?.message || "unknown"));
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const reordered = [...items];
    const tmp = reordered[idx];
    reordered[idx] = reordered[swapIdx];
    reordered[swapIdx] = tmp;
    // reassign sort_order sequentially
    const updates = reordered.map((it, i) => ({ ...it, sort_order: i }));
    setItems(updates);
    try {
      const supabase = getSupabaseClient();
      for (const it of updates) {
        await (supabase.from("featured_items") as any).update({ sort_order: it.sort_order }).eq("id", it.id);
      }
    } catch (e) {
      console.error("Reorder save failed:", e);
    }
  }

  async function saveCaption(id: string, caption: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, caption } : i)));
    try {
      const supabase = getSupabaseClient();
      await (supabase.from("featured_items") as any).update({ caption: caption || null }).eq("id", id);
    } catch (e) {
      console.error("Caption save failed:", e);
    }
  }

  async function saveMeta() {
    setSavingMeta(true);
    setStatus("");
    try {
      const supabase = getSupabaseClient();
      const { error } = await (supabase.from("featured_slot") as any).upsert({
        id: "home", title: title.trim() || null, is_active: isActive, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus("Saved. Refresh the homepage to see it.");
    } catch (e: any) {
      setStatus("Save failed: " + (e?.message || "unknown error"));
    }
    setSavingMeta(false);
  }

  if (guardLoading) return <main style={{ padding: "120px 24px", textAlign: "center", color: "#888" }}>Checking access…</main>;
  if (!isAdmin) return <main style={{ padding: "120px 24px", textAlign: "center", color: "#888" }}>Admin access required.</main>;

  const label: React.CSSProperties = { display: "block", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(201,168,76,0.85)", marginBottom: "0.4rem", marginTop: "1.25rem" };
  const input: React.CSSProperties = { width: "100%", padding: "0.7rem 0.9rem", background: "#0c0b08", border: "0.5px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#fff", fontSize: "0.9rem" };
  const btn: React.CSSProperties = { padding: "0.7rem 1rem", background: "#c9a84c", color: "#0c0b08", border: 0, borderRadius: 4, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" };

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 80px" }}>
      <Link href="/admin" style={{ color: "rgba(201,168,76,0.85)", fontSize: "0.8rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: "1rem 0 0.25rem" }}>Homepage Featured Box</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Add multiple videos or photos. Visitors scroll through them left-to-right. Reorder, caption, or remove each.
      </p>

      {loading ? <p style={{ color: "#888" }}>Loading…</p> : (
        <>
          <label style={label}>Overall title (optional)</label>
          <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. This Week on Culture Collective" />

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "1rem", cursor: "pointer", color: "#fff", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#c9a84c" }} />
            Show this on the homepage
          </label>

          <button onClick={saveMeta} disabled={savingMeta} style={{ ...btn, marginTop: "1rem", opacity: savingMeta ? 0.6 : 1 }}>
            {savingMeta ? "Saving…" : "Save title & on/off"}
          </button>

          <div style={{ height: 1, background: "rgba(201,168,76,0.15)", margin: "2rem 0" }} />

          <label style={label}>Add media</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...btn, opacity: uploading ? 0.6 : 1 }}>
              {uploading ? "Uploading…" : "Choose / Camera (multiple)"}
            </button>
          </div>

          <label style={label}>…or paste a link</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input style={{ ...input, flex: 1 }} value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="YouTube, Vimeo, TikTok, Instagram, .mp4, image URL" />
            <button onClick={addLink} style={btn}>Add</button>
          </div>

          <div style={{ height: 1, background: "rgba(201,168,76,0.15)", margin: "2rem 0" }} />

          <label style={label}>Items in the box ({items.length})</label>
          {items.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.85rem" }}>No items yet. Add files or a link above.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((it, i) => (
                <div key={it.id} style={{ border: "0.5px solid rgba(201,168,76,0.2)", borderRadius: 6, padding: 12, background: "#0c0b08" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: "rgba(201,168,76,0.85)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>#{i + 1} · {it.media_type}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => move(it.id, -1)} disabled={i === 0} style={{ ...btn, padding: "0.3rem 0.6rem", opacity: i === 0 ? 0.4 : 1 }}>↑</button>
                      <button onClick={() => move(it.id, 1)} disabled={i === items.length - 1} style={{ ...btn, padding: "0.3rem 0.6rem", opacity: i === items.length - 1 ? 0.4 : 1 }}>↓</button>
                      <button onClick={() => removeItem(it.id)} style={{ ...btn, padding: "0.3rem 0.6rem", background: "#e06666", color: "#fff" }}>✕</button>
                    </div>
                  </div>
                  {it.media_type === "image" ? (
                    <img src={it.media_url} alt="" style={{ width: "100%", maxHeight: 220, objectFit: "contain", background: "#000", borderRadius: 4 }} />
                  ) : (
                    <VideoEmbed url={it.media_url} height={200} />
                  )}
                  <input style={{ ...input, marginTop: 8 }} defaultValue={it.caption || ""} placeholder="Caption (optional)" onBlur={(e) => saveCaption(it.id, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {status && <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: status.toLowerCase().includes("fail") || status.toLowerCase().includes("error") ? "#e06666" : "#7fc97f" }}>{status}</p>}
        </>
      )}
    </main>
  );
}
