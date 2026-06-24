"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";
import VideoEmbed from "../../components/video-embed";

export default function FeaturedSlotAdmin() {
  const { loading: guardLoading, isAdmin } = useAdminGuard("/admin/featured");
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guardLoading || !isAdmin) return;
    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await (supabase.from("featured_slot") as any)
          .select("*").eq("id", "home").limit(1);
        const row = Array.isArray(data) ? data[0] : data;
        if (row) {
          setVideoUrl(row.video_url || "");
          setTitle(row.title || "");
          setCaption(row.caption || "");
          setIsActive(!!row.is_active);
        }
      } catch (e) {
        console.error("Load featured slot failed:", e);
      }
      setLoading(false);
    }
    load();
  }, [guardLoading, isAdmin]);

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const supabase = getSupabaseClient();
      const { error } = await (supabase.from("featured_slot") as any).upsert({
        id: "home",
        video_url: videoUrl.trim() || null,
        title: title.trim() || null,
        caption: caption.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus("Saved. Refresh the homepage to see it.");
    } catch (e: any) {
      setStatus("Save failed: " + (e?.message || "unknown error"));
    }
    setSaving(false);
  }

  if (guardLoading) {
    return <main style={{ padding: "120px 24px", textAlign: "center", color: "#888" }}>Checking access…</main>;
  }
  if (!isAdmin) {
    return <main style={{ padding: "120px 24px", textAlign: "center", color: "#888" }}>Admin access required.</main>;
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase",
    color: "rgba(201,168,76,0.85)", marginBottom: "0.4rem", marginTop: "1.25rem",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.7rem 0.9rem", background: "#0c0b08",
    border: "0.5px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#fff", fontSize: "0.9rem",
  };

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "100px 24px 80px" }}>
      <Link href="/admin" style={{ color: "rgba(201,168,76,0.85)", fontSize: "0.8rem", textDecoration: "none" }}>← Admin</Link>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: "1rem 0 0.25rem" }}>Homepage Featured Slot</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Set the video that headlines the homepage. Turn it off to fall back to the default.
      </p>

      {loading ? (
        <p style={{ color: "#888" }}>Loading…</p>
      ) : (
        <>
          <label style={labelStyle}>Video link</label>
          <input style={inputStyle} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube, Vimeo, TikTok, Instagram, or .mp4 URL" />

          {videoUrl.trim() && (
            <div style={{ marginTop: 16 }}>
              <VideoEmbed url={videoUrl.trim()} height={260} />
            </div>
          )}

          <label style={labelStyle}>Title</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. First Interview — Dropping Tonight" />

          <label style={labelStyle}>Caption (optional)</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={caption}
            onChange={(e) => setCaption(e.target.value)} placeholder="A short line under the video" />

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "1.5rem", cursor: "pointer", color: "#fff", fontSize: "0.9rem" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "#c9a84c" }} />
            Show this on the homepage
          </label>

          <button onClick={save} disabled={saving}
            style={{ marginTop: "1.75rem", width: "100%", padding: "0.85rem", background: "#c9a84c",
              color: "#0c0b08", border: 0, borderRadius: 4, fontWeight: 700, fontSize: "0.9rem",
              letterSpacing: "0.04em", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save featured slot"}
          </button>

          {status && (
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: status.startsWith("Save failed") ? "#e06666" : "#7fc97f" }}>{status}</p>
          )}
        </>
      )}
    </main>
  );
}
