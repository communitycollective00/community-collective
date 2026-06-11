"use client";

import { useState } from "react";
import Link from "next/link";

export type PostType = "event" | "story" | "insight" | "opportunity";

interface ContentPostProps {
  id: string;
  type: PostType;
  creatorId: string;
  creatorName: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  title: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  publishedAt: string;
  location?: string;
  tags?: string[];
  isSaved?: boolean;
  onSave?: (postId: string, saved: boolean) => void;
  onShare?: (postId: string) => void;
}

const typeConfig: Record<PostType, { label: string; color: string; icon: string }> = {
  event: {
    label: "Event Coverage",
    color: "#8b7355",
    icon: "📍",
  },
  story: {
    label: "Community Story",
    color: "#9b8b7e",
    icon: "📖",
  },
  insight: {
    label: "Insight",
    color: "#a89968",
    icon: "💡",
  },
  opportunity: {
    label: "Opportunity",
    color: "#b8a588",
    icon: "🔗",
  },
};

export default function ContentPost({
  id,
  type,
  creatorId,
  creatorName,
  creatorUsername,
  creatorAvatar,
  title,
  caption,
  mediaUrl,
  mediaType = "image",
  publishedAt,
  location,
  tags = [],
  isSaved = false,
  onSave,
  onShare,
}: ContentPostProps) {
  const [saved, setSaved] = useState(isSaved);
  const config = typeConfig[type];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return publishedAt;
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
      <article className="content-post">
        {/* Header */}
        <div className="content-post__header">
          <div className="content-post__creator">
            {creatorAvatar && (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="content-post__avatar"
              />
            )}
            <div className="content-post__creator-info">
              <p className="content-post__creator-name">{creatorName}</p>
              {creatorUsername && (
                <p className="content-post__creator-username">@{creatorUsername}</p>
              )}
            </div>
          </div>
          <span className="content-post__badge" style={{ backgroundColor: config.color }}>
            {config.icon} {config.label}
          </span>
        </div>

        {/* Media */}
        {mediaUrl && (
          <div className="content-post__media">
            {mediaType === "image" && (
              <img src={mediaUrl} alt={title} className="content-post__image" />
            )}
            {mediaType === "video" && (
              <video src={mediaUrl} controls className="content-post__video" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="content-post__body">
          <h3 className="content-post__title">{title}</h3>
          <p className="content-post__caption">{caption}</p>

          {location && (
            <p className="content-post__location">📍 {location}</p>
          )}

          {tags.length > 0 && (
            <div className="content-post__tags">
              {tags.map((tag, idx) => (
                <span key={idx} className="content-post__tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="content-post__footer">
          <time className="content-post__date">{formatDate(publishedAt)}</time>
          <div className="content-post__actions">
            <button
              className={`content-post__action ${saved ? "content-post__action--saved" : ""}`}
              onClick={handleSave}
              title={saved ? "Unsave" : "Save"}
              aria-label={saved ? "Unsave" : "Save"}
            >
              📌
            </button>
            <button
              className="content-post__action"
              onClick={handleShare}
              title="Share"
              aria-label="Share"
            >
              ↗️
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
