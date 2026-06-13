"use client";

import { useEffect, useState } from "react";
import MediaFeedCard from "./media-feed-card";
import InterviewPost from "./interview-post";
import ContentPost from "./content-post";

interface Post {
  id: string;
  type: "interview" | "event" | "story" | "insight" | "opportunity";
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
  // Interview-specific
  guestName?: string;
  guestTitle?: string;
  guestOrganization?: string;
  coverImage?: string;
  interviewSummary?: string;
  keyTakeaways?: string[];
  isSaved?: boolean;
}

interface MediaFeedProps {
  posts: Post[];
  loading?: boolean;
  onSave?: (postId: string, saved: boolean) => void;
  onShare?: (postId: string) => void;
}

export default function MediaFeed({
  posts,
  loading = false,
  onSave,
  onShare,
}: MediaFeedProps) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const handleSave = (postId: string, savedState: boolean) => {
    setSaved((prev) => {
      const newSet = new Set(prev);
      if (savedState) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
    onSave?.(postId, savedState);
  };

  const handleShare = (postId: string) => {
    onShare?.(postId);
  };

  if (loading) {
    return (
      <div className="media-feed" style={{ opacity: 0.5 }}>
        <div className="post-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-media"></div>
          <div className="skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="media-feed-empty">
        <div className="media-feed-empty-state">
          <p className="media-feed-empty-icon">📹</p>
          <h2>No posts yet</h2>
          <p>Be the first to share something</p>
        </div>
      </div>
    );
  }

  return (
    <div className="media-feed">
      {posts.map((post) => (
        <div key={post.id}>
          {post.type === "interview" ? (
            <InterviewPost
              id={post.id}
              creatorId={post.creatorId}
              creatorName={post.creatorName}
              creatorUsername={post.creatorUsername}
              creatorAvatar={post.creatorAvatar}
              guestName={post.guestName || "Guest"}
              guestTitle={post.guestTitle || ""}
              guestOrganization={post.guestOrganization || ""}
              coverImage={post.coverImage || post.mediaUrl || ""}
              summary={post.interviewSummary || post.caption}
              videoUrl={post.mediaType === "video" ? post.mediaUrl : undefined}
              keyTakeaways={post.keyTakeaways || []}
              publishedAt={post.publishedAt}
              isSaved={saved.has(post.id)}
              onSave={handleSave}
              onShare={handleShare}
            />
          ) : (
            <ContentPost
              id={post.id}
              type={post.type}
              creatorId={post.creatorId}
              creatorName={post.creatorName}
              creatorUsername={post.creatorUsername}
              creatorAvatar={post.creatorAvatar}
              title={post.title}
              caption={post.caption}
              mediaUrl={post.mediaUrl}
              mediaType={post.mediaType}
              publishedAt={post.publishedAt}
              location={post.location}
              tags={post.tags}
              isSaved={saved.has(post.id)}
              onSave={handleSave}
              onShare={handleShare}
            />
          )}
        </div>
      ))}
    </div>
  );
}
