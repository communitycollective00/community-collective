"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabase";

export default function CreateInterviewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    guestName: "", guestTitle: "", organization: "",
    coverUrl: "", videoUrl: "", summary: "", keyTakeaways: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const sb = getSupabaseClient();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error("No active session — cannot upload.");
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await sb.storage.from(bucket).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      console.error("Upload error:", JSON.stringify(error));
      throw error;
    }
    const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName.trim()) { setError("Guest name is required."); return; }
    setSaving(true); setError("");

    try {
      const sb = getSupabaseClient();
      const { data: { session } } = await sb.auth.getSession();
      const user = session?.user;
      if (!user) { setError("Not logged in."); setSaving(false); return; }

      let finalCoverUrl = form.coverUrl || null;
      if (coverFile) {
        setUploading(true);
        finalCoverUrl = await uploadFile(coverFile, "posts");
        setUploading(false);
      }

      let finalVideoUrl = form.videoUrl || null;
      if (videoFile) {
        setUploading(true);
        finalVideoUrl = await uploadFile(videoFile, "posts");
        setUploading(false);
      }

const { error: saveError } = await sb.from("posts").insert({
        profile_id: user.id,
        post_type: "interview",
        title: form.guestName,
        author_name: user.user_metadata?.full_name || user.email || "Unknown",
        interview_guest_name: form.guestName,
        interview_guest_title: form.guestTitle,
        interview_guest_organization: form.organization,
        interview_cover_url: finalCoverUrl,
        interview_summary: form.summary,
        interview_key_takeaways: form.keyTakeaways
          ? form.keyTakeaways.split("\n").filter(Boolean)
          : [],
        media_url: finalVideoUrl,
        is_published: true,
        status: "published",
      });
      if (saveError) {
        console.error("Insert error:", JSON.stringify(saveError));
        throw saveError;
      }

      router.push("/posts");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", padding: "24px", fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 36, color: "#C9A84C", marginBottom: 24 }}>
        PUBLISH INTERVIEW
      </h1>

      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #C9A84C", color: "#C9A84C", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>GUEST NAME *</label>
          <input
            value={form.guestName}
            onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 15, boxSizing: "border-box" }}
            placeholder="Full name"
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>TITLE</label>
          <input
            value={form.guestTitle}
            onChange={e => setForm(f => ({ ...f, guestTitle: e.target.value }))}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 15, boxSizing: "border-box" }}
            placeholder="Job title"
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>ORGANIZATION</label>
          <input
            value={form.organization}
            onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 15, boxSizing: "border-box" }}
            placeholder="Company or org"
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>COVER IMAGE</label>
          {coverPreview && (
            <img src={coverPreview} alt="Cover preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0] ?? null;
              setCoverFile(file);
              if (file) setCoverPreview(URL.createObjectURL(file));
            }}
            style={{ color: "#fff", fontSize: 14 }}
          />
          <input
            value={form.coverUrl}
            onChange={e => setForm(f => ({ ...f, coverUrl: e.target.value }))}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 14, marginTop: 8, boxSizing: "border-box" }}
            placeholder="Or paste image URL"
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>INTERVIEW VIDEO</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files?.[0] ?? null)}
            style={{ color: "#fff", fontSize: 14 }}
          />
          <input
            value={form.videoUrl}
            onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 14, marginTop: 8, boxSizing: "border-box" }}
            placeholder="Or paste video URL"
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>SUMMARY</label>
          <textarea
            value={form.summary}
            onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
            rows={4}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 15, resize: "vertical", boxSizing: "border-box" }}
            placeholder="What was this interview about?"
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#C9A84C", fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>KEY TAKEAWAYS</label>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>One takeaway per line</p>
          <textarea
            value={form.keyTakeaways}
            onChange={e => setForm(f => ({ ...f, keyTakeaways: e.target.value }))}
            rows={4}
            style={{ width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "10px 12px", borderRadius: 6, fontSize: 15, resize: "vertical", boxSizing: "border-box" }}
            placeholder="One takeaway per line"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || saving}
          style={{
            background: uploading || saving ? "#555" : "#C9A84C",
            color: "#080808",
            border: "none",
            padding: "14px 24px",
            borderRadius: 8,
            fontSize: 16,
            fontFamily: "Bebas Neue, sans-serif",
            fontWeight: 800,
            letterSpacing: 2,
            cursor: uploading || saving ? "not-allowed" : "pointer",
            marginTop: 8,
          }}
        >
          {uploading ? "UPLOADING MEDIA..." : saving ? "PUBLISHING..." : "PUBLISH INTERVIEW"}
        </button>
      </form>
    </div>
  );
}
