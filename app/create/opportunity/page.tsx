"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { isProfessionalRole } from "../../../lib/roles";
import { useAuth } from "../../components/auth-provider";

type ProfileData = { role: string | null };

export default function CreateOpportunityPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
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
    if (!title.trim()) {
      setStatus("Please add an opportunity title.");
      return;
    }

    setIsSubmitting(true);
    const { data } = await getSupabaseClient().auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }

    const fullDescription = [
      description.trim(),
      location.trim() ? `Location: ${location.trim()}` : null,
      linkUrl.trim() ? `Apply/Learn More: ${linkUrl.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const payload = {
      title: title.trim(),
      body: fullDescription || null,
      caption: null,
      post_type: "opportunity",
      media_type: "opportunity",
      visibility: "public",
      external_url: linkUrl.trim() || null,
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
      setStatus(result?.error || "Unable to share opportunity.");
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
          <h1>💼 Post an Opportunity</h1>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="opp-title">Opportunity Title</label>
            <input
              id="opp-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grant Application: Climate Innovation 2024"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="opp-description">Description</label>
            <textarea
              id="opp-description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the opportunity, requirements, and why it matters..."
            />
            <p className="form-hint">{description.length} characters</p>
          </div>

          <div className="form-group">
            <label htmlFor="opp-location">Location (optional)</label>
            <input
              id="opp-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Remote, Brooklyn, or anywhere"
            />
          </div>

          <div className="form-group">
            <label htmlFor="opp-link">Link (optional)</label>
            <input
              id="opp-link"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/opportunity"
            />
            <p className="form-hint">Link to application or more information</p>
          </div>

          {status && <p className="form-error">{status}</p>}

          <div className="form-actions">
            <button 
              className="gold-btn" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share Opportunity"}
            </button>
            <Link href="/create" className="cancel-button">Cancel</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
