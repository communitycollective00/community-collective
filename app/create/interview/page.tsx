"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabase";

export default function CreateInterviewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    guestName: "",
    guestTitle: "",
    organization: "",
    coverUrl: "",
    videoUrl: "",
    summary: "",
    keyTakeaways: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async (file: File, bucket: string) => {
    const sb = getSupabaseClient();
    const ext = file.name.split(".").pop() || "";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await sb.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.guestName.trim()) {
      setError("Guest name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const sb = getSupabaseClient();
      const { data: sessionData } = await sb.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setError("Not logged in.");
        setSaving(false);
        return;
      }

      setUploading(true);
      let finalCoverUrl = form.coverUrl;
      let finalVideoUrl = form.videoUrl;

      if (coverFile) {
        finalCoverUrl = await uploadFile(coverFile, "posts");
      }

      if (videoFile) {
        finalVideoUrl = await uploadFile(videoFile, "posts");
      }

      setUploading(false);

      const { data: profile } = await sb
        .from("profiles")
        .select("full_name, username")
        .eq("id", user.id)
        .single();

      const takeawaysArray = form.keyTakeaways
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean);

      const { error: saveError } = await sb.from("posts").insert({
        author_id: user.id,
        author_name: profile?.full_name || profile?.username || user.email,
        post_type: "interview",
        title: form.guestName,
        body: form.summary,
        interview_guest_name: form.guestName,
        interview_guest_title: form.guestTitle,
        interview_guest_organization: form.organization,
        interview_cover_url: finalCoverUrl,
        interview_summary: form.summary,
        interview_key_takeaways: takeawaysArray,
        media_url: finalVideoUrl,
        image_url: finalCoverUrl,
        is_published: true,
      });

      if (saveError) {
        throw saveError;
      }

      router.push("/posts");
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem 1rem",
    borderRadius: 10,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.4rem",
    color: "var(--gold)",
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  const btnSecondary: React.CSSProperties = {
    padding: "0.6rem 1.2rem",
    borderRadius: 8,
    border: "1px solid var(--gold)",
    background: "rgba(244,207,112,0.08)",
    color: "var(--gold)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  return (
    <main className="premium-page" style={{ paddingTop: 80 }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              color: "var(--gold)",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.4rem",
            }}
          >
            Community Collective
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>New Interview</h1>
          <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
            Publish a conversation that gives the community real knowledge and access.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220,50,50,0.12)",
              border: "1px solid rgba(220,50,50,0.4)",
              borderRadius: 10,
              padding: "0.85rem 1rem",
              marginBottom: "1.5rem",
              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Guest Name *</label>
            <input
              style={inputStyle}
              placeholder="Full name of your guest"
              value={form.guestName}
              onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Guest Title</label>
              <input
                style={inputStyle}
                placeholder="e.g. Attorney, Coach, Founder"
                value={form.guestTitle}
                onChange={e => setForm(f => ({ ...f, guestTitle: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelStyle}>Organization</label>
              <input
                style={inputStyle}
                placeholder="Company or org name"
                value={form.organization}
                onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Cover Image</label>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: "0.75rem",
                  border: "1px solid var(--border)",
                }}
              />
            )}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => (document.getElementById("coverInput") as HTMLInputElement)?.click()}
              >
                📷 Upload Image
              </button>
              <input
                style={{ flex: 1, minWidth: 160, ...inputStyle }}
                placeholder="Or paste image URL"
                value={form.coverUrl}
                onChange={e => {
                  setForm(f => ({ ...f, coverUrl: e.target.value }));
                  setCoverPreview(e.target.value);
                  setCoverFile(null);
                }}
              />
            </div>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setCoverFile(file);
                setCoverPreview(URL.createObjectURL(file));
                setForm(f => ({ ...f, coverUrl: "" }));
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Interview Video</label>
            {videoFile && (
              <p style={{ color: "var(--gold)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                ✅ {videoFile.name}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => (document.getElementById("videoInput") as HTMLInputElement)?.click()}
              >
                🎬 Upload Video
              </button>
              <input
                style={{ flex: 1, minWidth: 160, ...inputStyle }}
                placeholder="Or paste video URL (YouTube, Vimeo, direct)"
                value={form.videoUrl}
                onChange={e => {
                  setForm(f => ({ ...f, videoUrl: e.target.value }));
                  setVideoFile(null);
                }}
              />
            </div>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setVideoFile(file);
                setForm(f => ({ ...f, videoUrl: "" }));
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Summary / Description</label>
            <textarea
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="What did this conversation cover? Why does it matter to the community?"
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
            />
          </div>

          <div>
            <label style={labelStyle}>Key Takeaways</label>
            <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 0, marginBottom: "0.5rem" }}>
              One takeaway per line
            </p>
            <textarea
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder={"Know your rights before you sign anything.\nFunding exists — most people just don't know where to look.\nCommunity connections are your best asset."}
              value={form.keyTakeaways}
              onChange={e => setForm(f => ({ ...f, keyTakeaways: e.target.value }))}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: 12,
              border: "none",
              background: saving ? "var(--border)" : "var(--gold)",
              color: saving ? "var(--muted)" : "#000",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {uploading ? "Uploading media..." : saving ? "Publishing..." : "Publish Interview"}
          </button>
        </div>
      </div>
    </main>
  );
}
