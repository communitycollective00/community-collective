"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { isProfessionalRole } from "../../../lib/roles";
import { useAuth } from "../../components/auth-provider";

type ProfileData = { role: string | null };

export default function CreateVideoPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, profile: providerProfile, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (providerProfile) {
      setProfile({ role: providerProfile.role });
    } else if (!authLoading) {
      setProfile({ role });
    }
  }, [providerProfile, role, authLoading]);

  const canPublish = isProfessionalRole(profile?.role) || profile?.role === "admin";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canPublish) {
      setStatus("Only verified professionals can publish.");
      return;
    }
    if (!mediaUrl.trim() && !selectedFile) {
      setStatus("Please add a video file or paste a video link.");
      return;
    }

    setIsSubmitting(true);
    const { data } = await getSupabaseClient().auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }

    const payload = {
      title: caption.trim() || "Video",
      caption: caption.trim() || null,
      post_type: "video",
      media_type: "video",
      media_url: mediaUrl.trim(),
      visibility: "public",
      body: caption.trim() || null,
    };

    // If a local video file was selected, attempt to upload it to storage
    if (selectedFile) {
      try {
        const file = selectedFile;
        const sessionResp = await getSupabaseClient().auth.getSession();
        const userId = sessionResp?.data?.session?.user?.id;
        const fileExt = (file.name.split(".").pop() || "mp4").replace(/[^a-z0-9]/gi, "");
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadErr } = await getSupabaseClient().storage.from("media").upload(path, file, { upsert: true });
        if (uploadErr) {
          setStatus("File upload not configured — please paste a video link instead.");
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = getSupabaseClient().storage.from("media").getPublicUrl(path);
        const publicUrl = urlData?.publicUrl || "";
        payload.media_url = publicUrl;
      } catch (e) {
        setStatus("Failed to upload video. Try pasting a link instead.");
        setIsSubmitting(false);
        return;
      }
    }

    const response = await fetch("/api/posts/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus(result?.error || "Unable to share video.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  if (!user || !canPublish) {
    return (
      <main className="premium-page">
        <section className="premium-card onboarding-card">
          <h1>Access required</h1>
          <p className="muted">Sign in as a verified professional to share.</p>
          <div className="quick-links">
            <Link className="gold-link" href="/login">Login</Link>
            <Link className="gold-link" href="/create">Back to Create</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page create-flow-page">
      <section className="create-flow-card">
        <div className="create-flow-header">
          <Link href="/create" className="back-button">← Back</Link>
          <h1>🎥 Add a video</h1>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group file-first-group">
            <label htmlFor="video-file">Video</label>
            <input
              id="video-file"
              type="file"
              accept="video/*"
              capture
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setSelectedFile(f);
                setSelectedName(f ? f.name : null);
                if (f) {
                  setStatus("");
                }
              }}
            />

            {selectedName && (
              <div className="video-selected">Selected: {selectedName}</div>
            )}

            <div className="secondary-url">
              <button type="button" className="link-btn" onClick={() => setShowUrlInput((s) => !s)}>
                or paste a video link
              </button>
            </div>

            {showUrlInput && (
              <div style={{ marginTop: 8 }}>
                <input
                  id="video-url"
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
              </div>
            )}

            <p className="form-hint">Add a video from your device or paste an external link</p>
          </div>

          <div className="form-group">
            <label htmlFor="video-caption">Say something about it (optional)</label>
            <textarea
              id="video-caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about it"
            />
            <p className="form-hint">{caption.length} characters</p>
          </div>

          {status && <p className="form-error">{status}</p>}

          <div className="form-actions">
            <button
              className="gold-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share"}
            </button>
            <Link href="/create" className="cancel-button">Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
