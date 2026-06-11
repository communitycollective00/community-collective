"use client";

import Link from "next/link";

type PostCardProps = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  author_name: string | null;
  author_id: string;
  created_at: string | null;
  media_url?: string | null;
  image_url?: string | null;
};

export default function PostCard({
  id,
  title,
  body,
  post_type,
  author_name,
  author_id,
  created_at,
  media_url,
  image_url,
}: PostCardProps) {
  const displayTitle = title || "Untitled Post";
  const displayType = post_type || "Update";
  const displayAuthor = author_name || "Anonymous";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const image = image_url || media_url;

  return (
    <Link href={`/posts/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article className="post-card">
        {image && post_type === "image" && (
          <img
            src={image}
            alt={displayTitle}
            loading="lazy"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              borderRadius: "16px",
              marginBottom: "1rem",
              border: "1px solid var(--border)",
            }}
          />
        )}

        {media_url && post_type === "video" && (
          <video
            src={media_url}
            controls
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              borderRadius: "16px",
              marginBottom: "1rem",
              border: "1px solid var(--border)",
              backgroundColor: "#000",
            }}
          />
        )}

        <h3>{displayTitle}</h3>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
            {displayType}
          </p>
          {created_at && (
            <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
              {formatDate(created_at)}
            </p>
          )}
        </div>

        {body && (
          <p className="muted" style={{ margin: "0 0 0.75rem 0", lineHeight: "1.6" }}>
            {body.slice(0, 150)}
            {body.length > 150 ? "..." : ""}
          </p>
        )}

        {media_url && post_type !== "image" && post_type !== "video" && (
          <p className="muted" style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", textDecoration: "underline" }}>
            📎 Media attached
          </p>
        )}

        <p className="muted" style={{ margin: 0, fontSize: "0.85rem", fontStyle: "italic" }}>
          by {displayAuthor}
        </p>
      </article>
    </Link>
  );
}
