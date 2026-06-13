"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
  }, [providerProfile, role, authLoading, previewUrl]);

  useEffect(() => {
    if (fileInputRef.current && navigator.userActivation?.hasBeenActive) {
      fileInputRef.current.click();
    }
  }, []);

  const canPublish = isProfessionalRole(profile?.role) || profile?.role === "admin";


  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canPublish) {
      setStatus("Only verified professionals can publish.");
      return;
    }
    if (!selectedFile && !mediaUrl.trim()) {
      setStatus("Please choose a photo or paste an image link.");
      return;
    }

    setIsSubmitting(true);
    const { data } = await getSupabaseClient().auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }

    const payload: Record<string, unknown> = {
      title: caption.trim() || "Photo",
      body: caption.trim() || null,
      post_type: "image",
      media_url: undefined,
      image_url: undefined,
      is_published: true,
    };

    if (selectedFile) {
      try {
        const file = selectedFile;
        const sessionResp = await getSupabaseClient().auth.getSession();
        const userId = sessionResp?.data?.session?.user?.id;
        if (!userId) {
          setStatus("Unable to identify your user session.");
          setIsSubmitting(false);
          return;
        }
        const fileExt = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadErr } = await getSupabaseClient().storage.from("media").upload(path, file, { upsert: true });
        if (uploadErr) {
          setStatus("Photo upload failed. Try again or paste an image link.");
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = getSupabaseClient().storage.from("media").getPublicUrl(path);
        const publicUrl = urlData?.publicUrl || "";
        if (!publicUrl) {
          setStatus("Unable to generate file URL. Try again.");
          setIsSubmitting(false);
          return;
        }
        payload.media_url = publicUrl;
        payload.image_url = publicUrl;
      } catch (e) {
        setStatus("Failed to upload photo. Try again.");
        setIsSubmitting(false);
        return;
      }
    } else if (mediaUrl.trim()) {
      payload.media_url = mediaUrl.trim();
      payload.image_url = mediaUrl.trim();
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

    router.push("/");
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
            <input
              ref={fileInputRef}
              id="photo-file"
              className="file-input-hidden"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setSelectedFile(f);
                if (f) {
                  const obj = URL.createObjectURL(f);
                  setPreviewUrl(obj);
                  setMediaUrl("");
                  setStatus("");
                } else {
                  setPreviewUrl(null);
                }
              }}
            />

            <button type="button" className="media-picker-button" onClick={openPhotoPicker}>
              {previewUrl ? "Change photo" : "Open Camera / Choose Photo"}
            </button>

            {previewUrl && (
              <div className="media-preview">
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
            <label htmlFor="photo-caption">Say something about it</label>
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
