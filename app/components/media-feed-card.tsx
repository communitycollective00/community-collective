"use client";

import { useState } from "react";
import Link from "next/link";

interface MediaFeedCardProps {
  id: string;
  creator: {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  type: "interview" | "event" | "story" | "insight" | "opportunity";
  media?: {
    url: string;
    type: "image" | "video";
    alt: string;
  };
  caption: string;
  date: string;
  isSaved?: boolean;
  onSave?: (postId: string, saved: boolean) => void;
  onShare?: (postId: string) => void;
  metadata?: {
    interviewGuest?: string;
    interviewTitle?: string;
    eventName?: string;
    location?: string;
  };
}

const typeConfig = {
  interview: {
    label: "Interview",
    color: "#d4a574",
    icon: "🎤",
  },
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

export default function MediaFeedCard({
  id,
  creator,
  type,
  media,
  caption,
  date,
  isSaved = false,
  onSave,
  onShare,
  metadata,
}: MediaFeedCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const config = typeConfig[type];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return date;
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
      <article className="media-feed-card">
        {/* Header with Creator Info */}
        <div className="media-feed-card__header">
          <div className="media-feed-card__creator">
            {creator.avatar && (
              <img
                src={creator.avatar}
                alt={creator.name}
                className="media-feed-card__creator-avatar"
              />
            )}
            <div className="media-feed-card__creator-info">
              <p className="media-feed-card__creator-name">{creator.name}</p>
              {creator.username && (
                <p className="media-feed-card__creator-username">@{creator.username}</p>
              )}
            </div>
          </div>
          <span
            className="media-feed-card__badge"
            style={{ backgroundColor: config.color }}
          >
            {config.icon} {config.label}
          </span>
        </div>

        {/* Media Section */}
        {media && (
          <div className="media-feed-card__media">
            {media.type === "image" && (
              <img src={media.url} alt={media.alt} className="media-feed-card__image" />
            )}
            {media.type === "video" && (
              <div className="media-feed-card__video-container">
                <video src={media.url} poster={media.url} controls className="media-feed-card__video" />
              </div>
            )}
          </div>
        )}

        {/* Interview Metadata */}
        {type === "interview" && metadata?.interviewGuest && (
          <div className="media-feed-card__interview-meta">
            <p className="media-feed-card__interview-guest">
              {metadata.interviewGuest}
            </p>
            {metadata.interviewTitle && (
              <p className="media-feed-card__interview-title">
                {metadata.interviewTitle}
              </p>
            )}
          </div>
        )}

        {/* Caption */}
        <div className="media-feed-card__body">
          <p className="media-feed-card__caption">{caption}</p>
        </div>

        {/* Footer with Date and Actions */}
        <div className="media-feed-card__footer">
          <time className="media-feed-card__date">{formatDate(date)}</time>
          <div className="media-feed-card__actions">
            <button
              className={`media-feed-card__action ${saved ? "media-feed-card__action--saved" : ""}`}
              onClick={handleSave}
              title={saved ? "Unsave" : "Save"}
              aria-label={saved ? "Unsave post" : "Save post"}
            >
              📌
            </button>
            <button
              className="media-feed-card__action"
              onClick={handleShare}
              title="Share"
              aria-label="Share post"
            >
              ↗️
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
