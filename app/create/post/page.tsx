"use client";

import { useState } from "react";
import Link from "next/link";

type PostType = "interview" | "event" | "story" | "insight" | "opportunity";

interface PostCreationState {
  type: PostType;
  title: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  location?: string;
  interviewGuest?: string;
  interviewTitle?: string;
  interviewOrg?: string;
  interviewSummary?: string;
  keyTakeaways: string[];
  tags: string[];
}

const postTypes: Array<{ id: PostType; label: string; description: string; icon: string }> = [
  {
    id: "interview",
    label: "Interview",
    description: "Feature a guest conversation or Q&A",
    icon: "🎤",
  },
  {
    id: "event",
    label: "Event Coverage",
    description: "Document what happened at an event",
    icon: "📍",
  },
  {
    id: "story",
    label: "Community Story",
    description: "Share a narrative or personal account",
    icon: "📖",
  },
  {
    id: "insight",
    label: "Share Insight",
    description: "Contribute knowledge or perspective",
    icon: "💡",
  },
  {
    id: "opportunity",
    label: "Opportunity",
    description: "Highlight a path or access point",
    icon: "🔗",
  },
];

export default function PostCreationPage() {
  const [step, setStep] = useState<"select-type" | "upload-media" | "add-details" | "review">(
    "select-type"
  );
  const [post, setPost] = useState<PostCreationState>({
    type: "story",
    title: "",
    caption: "",
    tags: [],
    keyTakeaways: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: PostType) => {
    setPost((prev) => ({ ...prev, type }));
    setStep("upload-media");
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement media upload to Supabase storage
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        throw new Error("Please upload an image or video file");
      }

      // For now, create a local URL preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPost((prev) => ({
          ...prev,
          mediaUrl: event.target?.result as string,
          mediaType: isImage ? "image" : "video",
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload media");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToDetails = () => {
    if (!post.mediaUrl) {
      setError("Please upload media first");
      return;
    }
    setStep("add-details");
  };

  const handleAddKeyTakeaway = (takeaway: string) => {
    if (takeaway.trim()) {
      setPost((prev) => ({
        ...prev,
        keyTakeaways: [...prev.keyTakeaways, takeaway],
      }));
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !post.tags.includes(tag)) {
      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleRemoveTakeaway = (index: number) => {
    setPost((prev) => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index),
    }));
  };

  const handlePublish = async () => {
    if (!post.caption.trim()) {
      setError("Please add a caption");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Save to database
      console.log("Publishing post:", post);
      // Redirect to posts page after success
      window.location.href = "/posts";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-flow-page" style={{ paddingTop: "92px" }}>
      <div className="create-flow-card">
        <div className="create-flow-header">
          <h1>Create {post.type === "interview" ? "an" : "a"} {postTypes.find((t) => t.id === post.type)?.label}</h1>
          {step !== "select-type" && (
            <button
              className="back-button"
              onClick={() =>
                setStep(
                  step === "upload-media"
                    ? "select-type"
                    : step === "add-details"
                      ? "upload-media"
                      : "add-details"
                )
              }
            >
              ← Back
            </button>
          )}
        </div>

        {/* Step 1: Select Type */}
        {step === "select-type" && (
          <div className="post-type-selector">
            <p className="post-type-intro">What are you sharing today?</p>
            <div className="post-type-grid">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  className={`post-type-card ${post.type === type.id ? "post-type-card--selected" : ""}`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <span className="post-type-icon">{type.icon}</span>
                  <p className="post-type-label">{type.label}</p>
                  <p className="post-type-description">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Upload Media */}
        {step === "upload-media" && (
          <div className="post-media-upload">
            <div className="media-upload-dropzone">
              <input
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="media-upload-input"
                disabled={loading}
              />
              <label htmlFor="media-upload" className="media-upload-label">
                <span className="media-upload-icon">📸</span>
                <p className="media-upload-text">
                  {post.mediaUrl ? "Change media" : "Drop media here or click to upload"}
                </p>
                <p className="media-upload-hint">Photo or video up to 100MB</p>
              </label>
            </div>

            {post.mediaUrl && (
              <div className="media-preview">
                {post.mediaType === "image" && (
                  <img src={post.mediaUrl} alt="Preview" className="media-preview-img" />
                )}
                {post.mediaType === "video" && (
                  <video src={post.mediaUrl} controls className="media-preview-video" />
                )}
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button
              className="gold-btn"
              onClick={handleProceedToDetails}
              disabled={!post.mediaUrl || loading}
            >
              {loading ? "Uploading..." : "Next: Add Details"}
            </button>
          </div>
        )}

        {/* Step 3: Add Details */}
        {step === "add-details" && (
          <form className="create-form">
            {/* Common fields */}
            <div className="form-group">
              <label htmlFor="caption">Caption</label>
              <textarea
                id="caption"
                value={post.caption}
                onChange={(e) => setPost((prev) => ({ ...prev, caption: e.target.value }))}
                placeholder="Tell us about this..."
                rows={4}
              />
              <p className="form-hint">{post.caption.length}/500 characters</p>
            </div>

            {post.type !== "interview" && (
              <div className="form-group">
                <label htmlFor="location">Location (optional)</label>
                <input
                  id="location"
                  type="text"
                  value={post.location || ""}
                  onChange={(e) => setPost((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Where is this from?"
                />
              </div>
            )}

            {/* Interview-specific fields */}
            {post.type === "interview" && (
              <>
                <div className="form-group">
                  <label htmlFor="guest-name">Guest Name *</label>
                  <input
                    id="guest-name"
                    type="text"
                    value={post.interviewGuest || ""}
                    onChange={(e) => setPost((prev) => ({ ...prev, interviewGuest: e.target.value }))}
                    placeholder="Who are you interviewing?"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guest-title">Title</label>
                    <input
                      id="guest-title"
                      type="text"
                      value={post.interviewTitle || ""}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, interviewTitle: e.target.value }))
                      }
                      placeholder="Their role or expertise"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="guest-org">Organization</label>
                    <input
                      id="guest-org"
                      type="text"
                      value={post.interviewOrg || ""}
                      onChange={(e) =>
                        setPost((prev) => ({ ...prev, interviewOrg: e.target.value }))
                      }
                      placeholder="Organization or company"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="interview-summary">Interview Summary</label>
                  <textarea
                    id="interview-summary"
                    value={post.interviewSummary || ""}
                    onChange={(e) =>
                      setPost((prev) => ({ ...prev, interviewSummary: e.target.value }))
                    }
                    placeholder="What's the main takeaway from this interview?"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Key Takeaways</label>
                  <div className="takeaway-input-group">
                    <input
                      type="text"
                      placeholder="Add a key takeaway..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyTakeaway(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                  <div className="takeaway-list">
                    {post.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="takeaway-item">
                        <span>{takeaway}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTakeaway(idx)}
                          className="takeaway-remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            <div className="form-group">
              <label>Tags (optional)</label>
              <div className="tag-input-group">
                <input
                  type="text"
                  placeholder="Add tags..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
              <div className="tag-list">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="tag-badge">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <Link href="/posts" className="cancel-button">
                Cancel
              </Link>
              <button
                type="button"
                className="gold-btn"
                onClick={handlePublish}
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
