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
    if (!mediaUrl.trim()) {
      setStatus("Please add a photo.");
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
      media_url: mediaUrl.trim(),
      image_url: mediaUrl.trim(),
      visibility: "public",
      body: caption.trim() || null,
    };

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
          <h1>📷 Share a Photo</h1>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="photo-url">Photo URL</label>
            <input
              id="photo-url"
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              required
            />
            <p className="form-hint">Upload your photo and paste the URL here</p>
          </div>

          <div className="form-group">
            <label htmlFor="photo-caption">Caption (optional)</label>
            <textarea
              id="photo-caption"
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add context, insights, or a question..."
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
