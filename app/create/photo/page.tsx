"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { isProfessionalRole } from "../../../lib/roles";
import { useAuth } from "../../components/auth-provider";

type ProfileData = { role: string | null };

export default function CreatePhotoPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [providerProfile, role, authLoading]);

  const canPublish = isProfessionalRole(profile?.role) || profile?.role === "admin";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canPublish) {
      setStatus("Only verified professionals can publish.");
      return;
    }
    if (!mediaUrl.trim() && !selectedFile) {
      setStatus("Please add a photo or paste a link.");
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
      title: caption.trim() || "Photo",
      caption: caption.trim() || null,
      post_type: "image",
      media_type: "image",
      // If a file was selected we'll upload it to Supabase storage and set
      // `media_url`/`image_url` to the resulting public URL. If storage is
      // not configured (or upload fails), we currently fall back to an
      // externally-provided URL (the `mediaUrl` input). To wire storage,
      // connect here to `getSupabaseClient().storage.from('media').upload(...)`.
      media_url: mediaUrl.trim(),
      image_url: mediaUrl.trim(),
      visibility: "public",
      body: caption.trim() || null,
    };

    // If a local file was selected, attempt to upload it to the 'media'
    // storage bucket and replace the media_url with the public URL.
    if (selectedFile) {
      try {
        const file = selectedFile;
        const sessionResp = await getSupabaseClient().auth.getSession();
        const userId = sessionResp?.data?.session?.user?.id;
        const fileExt = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        // upload to 'media' bucket; if your project uses a different bucket
        // name change 'media' to the correct bucket.
        const { error: uploadErr } = await getSupabaseClient().storage.from("media").upload(path, file, { upsert: true });
        if (uploadErr) {
          // Storage might not be configured in some environments (dev preview).
          // In that case, surface a helpful message and instruct the user to
          // paste an external URL instead.
          setStatus("File upload not configured — please paste an external image link.");
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = getSupabaseClient().storage.from("media").getPublicUrl(path);
        const publicUrl = urlData?.publicUrl || "";
        payload.media_url = publicUrl;
        payload.image_url = publicUrl;
      } catch (e) {
        setStatus("Failed to upload image. Try pasting a link instead.");
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
      setStatus(result?.error || "Unable to share photo.");
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
          <h1>📷 Add a photo</h1>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group file-first-group">
            <label htmlFor="photo-file">Photo</label>
            <input
              id="photo-file"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setSelectedFile(f);
                if (f) {
                  try {
                    const obj = URL.createObjectURL(f);
                    setPreviewUrl(obj);
                    // keep mediaUrl empty until upload completes or user pastes a link
                    setMediaUrl("");
                    setStatus("");
                  } catch (err) {}
                } else {
                  setPreviewUrl(null);
                }
              }}
            />

            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Selected photo preview" />
              </div>
            )}

            <div className="secondary-url">
              <button type="button" className="link-btn" onClick={() => setShowUrlInput((s) => !s)}>
                or paste an image link
              </button>
            </div>

            {showUrlInput && (
              <div style={{ marginTop: 8 }}>
                <input
                  id="photo-url"
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            )}
            <p className="form-hint">Take a photo or choose from your device</p>
          </div>

          <div className="form-group">
            <label htmlFor="photo-caption">Say something about it (optional)</label>
            <textarea
              id="photo-caption"
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
