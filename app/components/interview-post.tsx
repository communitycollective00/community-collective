"use client";

import Link from "next/link";
import { useState } from "react";

interface InterviewPostProps {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  guestName: string;
  guestTitle: string;
  guestOrganization: string;
  coverImage: string;
  summary: string;
  videoUrl?: string;
  keyTakeaways: string[];
  publishedAt: string;
  isSaved?: boolean;
  onSave?: (postId: string, saved: boolean) => void;
  onShare?: (postId: string) => void;
}

export default function InterviewPost({
  id,
  creatorId,
  creatorName,
  creatorUsername,
  creatorAvatar,
  guestName,
  guestTitle,
  guestOrganization,
  coverImage,
  summary,
  videoUrl,
  keyTakeaways,
  publishedAt,
  isSaved = false,
  onSave,
  onShare,
}: InterviewPostProps) {
  const [saved, setSaved] = useState(isSaved);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = !saved;
    setSaved(newSaved);
    onSave?.(id, newSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(id);
  };

  return (
    <Link href={`/posts/${id}`}>
      <article className="interview-post">
        {/* Header */}
        <div className="interview-post__header">
          <div className="interview-post__creator">
            {creatorAvatar && (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="interview-post__creator-avatar"
              />
            )}
            <div className="interview-post__creator-info">
              <p className="interview-post__creator-name">{creatorName}</p>
              {creatorUsername && (
                <p className="interview-post__creator-username">@{creatorUsername}</p>
              )}
            </div>
          </div>
          <div className="interview-post__meta">
            <span className="interview-post__badge">🎤 Interview</span>
            <time className="interview-post__date">{formatDate(publishedAt)}</time>
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="interview-post__cover">
          <img src={coverImage} alt={guestName} className="interview-post__cover-image" />
          <div className="interview-post__cover-overlay" />
        </div>

        {/* Guest Information */}
        <div className="interview-post__guest-info">
          <h2 className="interview-post__guest-name">{guestName}</h2>
          <p className="interview-post__guest-title">{guestTitle}</p>
          {guestOrganization && (
            <p className="interview-post__guest-org">{guestOrganization}</p>
          )}
        </div>

        {/* Summary */}
        <div className="interview-post__body">
          <p className="interview-post__summary">{summary}</p>
        </div>

        {/* Video Indicator */}
        {videoUrl && (
          <div className="interview-post__video-indicator">
            <span className="interview-post__video-icon">▶</span>
            <span>Watch Interview</span>
          </div>
        )}

        {/* Key Takeaways */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <div className="interview-post__takeaways">
            <h3 className="interview-post__takeaways-title">Key Takeaways</h3>
            <ul className="interview-post__takeaways-list">
              {keyTakeaways.slice(0, 3).map((takeaway, idx) => (
                <li key={idx} className="interview-post__takeaway-item">
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="interview-post__footer">
          <button
            className={`interview-post__action ${saved ? "interview-post__action--saved" : ""}`}
            onClick={handleSave}
            title={saved ? "Unsave" : "Save"}
            aria-label={saved ? "Unsave interview" : "Save interview"}
          >
            📌
          </button>
          <button
            className="interview-post__action"
            onClick={handleShare}
            title="Share"
            aria-label="Share interview"
          >
            ↗️
          </button>
        </div>
      </article>
    </Link>
  );
}
