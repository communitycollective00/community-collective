"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";

interface InterviewTemplateProps {
  prefill?: {
    guestName?: string;
    guestTitle?: string;
    guestOrganization?: string;
    summary?: string;
    date?: string;
  };
  onSuccess?: (postId: string) => void;
}

export default function InterviewTemplate({ prefill, onSuccess }: InterviewTemplateProps) {
  const [step, setStep] = useState<"details" | "media" | "content" | "review">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [interview, setInterview] = useState({
    guestName: prefill?.guestName || "",
    guestTitle: prefill?.guestTitle || "",
    guestOrganization: prefill?.guestOrganization || "",
    summary: prefill?.summary || "",
    date: prefill?.date || new Date().toISOString().split("T")[0],
    coverImage: null as string | null,
    videoUrl: null as string | null,
    keyTakeaways: [] as string[],
    additionalNotes: "",
  });

  const [currentTakeaway, setCurrentTakeaway] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setInterview((prev) => ({
        ...prev,
        coverImage: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setInterview((prev) => ({
        ...prev,
        videoUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const addTakeaway = () => {
    if (currentTakeaway.trim()) {
      setInterview((prev) => ({
        ...prev,
        keyTakeaways: [...prev.keyTakeaways, currentTakeaway],
      }));
      setCurrentTakeaway("");
    }
  };

  const removeTakeaway = (index: number) => {
    setInterview((prev) => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index),
    }));
  };

  const handlePublish = async () => {
    if (!interview.guestName.trim()) {
      setError("Guest name is required");
      return;
    }

    if (!interview.summary.trim()) {
      setError("Interview summary is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const user = await supabase.auth.getUser();

      if (!user.data.user) {
        throw new Error("Must be logged in to publish");
      }

      // TODO: Upload media to Supabase storage
      // For now, using local URLs

      const { data, error: dbError } = await (supabase.from("posts") as any).insert({
        author_id: user.data.user.id,
        title: interview.guestName,
        body: interview.summary,
        post_type: "interview",
        caption: interview.summary,
        interview_guest_name: interview.guestName,
        interview_guest_title: interview.guestTitle || null,
        interview_guest_organization: interview.guestOrganization || null,
        interview_cover_url: interview.coverImage,
        interview_summary: interview.summary,
        interview_key_takeaways: interview.keyTakeaways,
        video_url: interview.videoUrl,
        is_published: true,
        created_at: new Date(interview.date).toISOString(),
      });

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        onSuccess?.(data[0].id);
        setInterview({
          guestName: "",
          guestTitle: "",
          guestOrganization: "",
          summary: "",
          date: new Date().toISOString().split("T")[0],
          coverImage: null,
          videoUrl: null,
          keyTakeaways: [],
          additionalNotes: "",
        });
        setStep("details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interview-template">
      <div className="interview-template-header">
        <h1>Quick Interview Template</h1>
        <p className="interview-template-subtitle">
          Publish interview content quickly with guided fields
        </p>
      </div>

      {/* Step Indicator */}
      <div className="interview-template-steps">
        <button
          className={`step-indicator ${step === "details" ? "step-indicator--active" : "step-indicator--complete"}`}
          onClick={() => setStep("details")}
        >
          <span className="step-number">1</span>
          <span className="step-label">Guest Details</span>
        </button>
        <button
          className={`step-indicator ${step === "media" ? "step-indicator--active" : ""}`}
          onClick={() => interview.guestName && setStep("media")}
        >
          <span className="step-number">2</span>
          <span className="step-label">Media</span>
        </button>
        <button
          className={`step-indicator ${step === "content" ? "step-indicator--active" : ""}`}
          onClick={() => interview.guestName && setStep("content")}
        >
          <span className="step-number">3</span>
          <span className="step-label">Content</span>
        </button>
        <button
          className={`step-indicator ${step === "review" ? "step-indicator--active" : ""}`}
          onClick={() => interview.guestName && interview.summary && setStep("review")}
        >
          <span className="step-number">4</span>
          <span className="step-label">Review</span>
        </button>
      </div>

      {/* Step: Guest Details */}
      {step === "details" && (
        <form className="interview-template-form" onSubmit={(e) => { e.preventDefault(); setStep("media"); }}>
          <div className="form-group">
            <label htmlFor="guest-name">Guest Name *</label>
            <input
              id="guest-name"
              type="text"
              value={interview.guestName}
              onChange={(e) => setInterview({ ...interview, guestName: e.target.value })}
              placeholder="Enter guest name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guest-title">Title / Role</label>
              <input
                id="guest-title"
                type="text"
                value={interview.guestTitle}
                onChange={(e) => setInterview({ ...interview, guestTitle: e.target.value })}
                placeholder="e.g., CEO, Artist, Organizer"
              />
            </div>
            <div className="form-group">
              <label htmlFor="guest-org">Organization</label>
              <input
                id="guest-org"
                type="text"
                value={interview.guestOrganization}
                onChange={(e) => setInterview({ ...interview, guestOrganization: e.target.value })}
                placeholder="Organization or company"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="interview-date">Interview Date</label>
            <input
              id="interview-date"
              type="date"
              value={interview.date}
              onChange={(e) => setInterview({ ...interview, date: e.target.value })}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="gold-btn">
            Next: Upload Media
          </button>
        </form>
      )}

      {/* Step: Media */}
      {step === "media" && (
        <form className="interview-template-form" onSubmit={(e) => { e.preventDefault(); setStep("content"); }}>
          <div className="form-group">
            <label>Cover Image</label>
            <div className="media-upload-dropzone">
              <input
                type="file"
                id="cover-image"
                accept="image/*"
                onChange={handleImageUpload}
                className="media-upload-input"
              />
              <label htmlFor="cover-image" className="media-upload-label">
                <span className="media-upload-icon">📷</span>
                <p className="media-upload-text">
                  {interview.coverImage ? "Change cover image" : "Upload cover image"}
                </p>
              </label>
            </div>
            {interview.coverImage && (
              <div className="media-preview">
                <img src={interview.coverImage} alt="Cover preview" className="media-preview-img" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Interview Video</label>
            <div className="media-upload-dropzone">
              <input
                type="file"
                id="interview-video"
                accept="video/*"
                onChange={handleVideoUpload}
                className="media-upload-input"
              />
              <label htmlFor="interview-video" className="media-upload-label">
                <span className="media-upload-icon">🎥</span>
                <p className="media-upload-text">
                  {interview.videoUrl ? "Change video" : "Upload interview video"}
                </p>
              </label>
            </div>
            {interview.videoUrl && (
              <p className="media-preview-hint">✓ Video uploaded</p>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setStep("details")}>
              Back
            </button>
            <button type="submit" className="gold-btn">
              Next: Add Content
            </button>
          </div>
        </form>
      )}

      {/* Step: Content */}
      {step === "content" && (
        <form className="interview-template-form" onSubmit={(e) => { e.preventDefault(); setStep("review"); }}>
          <div className="form-group">
            <label htmlFor="summary">Interview Summary *</label>
            <textarea
              id="summary"
              value={interview.summary}
              onChange={(e) => setInterview({ ...interview, summary: e.target.value })}
              placeholder="Write a summary of the interview. What was discussed? What are the main themes?"
              rows={6}
              required
            />
            <p className="form-hint">{interview.summary.length}/1000 characters</p>
          </div>

          <div className="form-group">
            <label>Key Takeaways</label>
            <div className="takeaway-input-group">
              <input
                type="text"
                value={currentTakeaway}
                onChange={(e) => setCurrentTakeaway(e.target.value)}
                placeholder="Add a key insight..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTakeaway();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTakeaway}
                className="gold-btn"
                style={{ whiteSpace: "nowrap" }}
              >
                Add
              </button>
            </div>
            <div className="takeaway-list">
              {interview.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="takeaway-item">
                  <span>{takeaway}</span>
                  <button
                    type="button"
                    onClick={() => removeTakeaway(idx)}
                    className="takeaway-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes (optional)</label>
            <textarea
              id="notes"
              value={interview.additionalNotes}
              onChange={(e) => setInterview({ ...interview, additionalNotes: e.target.value })}
              placeholder="Any other details about the interview..."
              rows={3}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setStep("media")}>
              Back
            </button>
            <button type="submit" className="gold-btn">
              Review & Publish
            </button>
          </div>
        </form>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <div className="interview-template-review">
          <div className="review-section">
            <h2>Interview Preview</h2>

            {interview.coverImage && (
              <img src={interview.coverImage} alt="Cover" className="review-image" />
            )}

            <div className="review-guest-info">
              <h3 className="review-guest-name">{interview.guestName}</h3>
              {interview.guestTitle && <p className="review-guest-title">{interview.guestTitle}</p>}
              {interview.guestOrganization && (
                <p className="review-guest-org">{interview.guestOrganization}</p>
              )}
              <p className="review-date">
                {new Date(interview.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="review-summary">
              <p>{interview.summary}</p>
            </div>

            {interview.keyTakeaways.length > 0 && (
              <div className="review-takeaways">
                <h4>Key Takeaways</h4>
                <ul>
                  {interview.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {interview.videoUrl && (
              <div className="review-video-indicator">
                <p>✓ Interview video included</p>
              </div>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setStep("content")} disabled={loading}>
              Back
            </button>
            <button
              type="button"
              className="gold-btn"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Interview"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
