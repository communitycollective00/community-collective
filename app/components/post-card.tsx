"use client";

import Link from "next/link";

type PostCardProps = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  media_type?: string | null;
  caption?: string | null;
  thumbnail_url?: string | null;
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
  media_type,
  caption,
  thumbnail_url,
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

  const image = image_url || media_url || thumbnail_url;

  return (
    <Link href={`/posts/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article className="post-card">
        {(post_type === 'image' || post_type === 'photo' || media_type === 'image') && image && (
          <img
            src={image}
            alt={displayTitle}
            onError={(e) => { (e.target as HTMLImageElement).src = '/original.html'; }}
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

        {(post_type === 'video' || media_type === 'video') && (media_url || image_url) && (
          <video controls style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16, marginBottom: '1rem' }}>
            <source src={media_url || image_url || ''} />
          </video>
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

        {media_url && post_type !== "image" && (
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
