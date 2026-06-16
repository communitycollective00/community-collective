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

function getYouTubeThumbnail(url: string): string | null {
  if (url.includes("shorts/")) {
    const id = url.split("shorts/")[1]?.split("?")[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  if (url.includes("watch")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  if (url.includes("youtube.com/embed/")) {
    const id = url.split("embed/")[1]?.split("?")[0];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

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

  const image = image_url || thumbnail_url;
  const isVideoType =
    post_type === "video" ||
    post_type === "interview" ||
    media_type === "video";

  const videoUrl = media_url || "";
  const isYouTube = videoUrl && isYouTubeUrl(videoUrl);
  const youtubeThumbnail = isYouTube ? getYouTubeThumbnail(videoUrl) : null;

  // For display image: prefer explicit image_url, fall back to thumbnail, then YouTube thumbnail
  const displayImage = image || (isYouTube ? youtubeThumbnail : media_url);

  return (
    <Link href={`/posts/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article className="post-card">

        {/* Image posts */}
        {(post_type === "image" || post_type === "photo" || media_type === "image") && displayImage && (
          <img
            src={displayImage}
            alt={displayTitle}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
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

        {/* Video / interview posts */}
        {isVideoType && (
          <>
            {isYouTube && youtubeThumbnail ? (
              // YouTube: show thumbnail with play button overlay
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 200,
                  borderRadius: 16,
                  marginBottom: "1rem",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <img
                  src={youtubeThumbnail}
                  alt={displayTitle}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* Play button overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.92)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Triangle play icon */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 3L17 10L5 17V3Z" fill="#111" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : videoUrl ? (
              // Direct MP4: native video player
              <video
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 16,
                  marginBottom: "1rem",
                  backgroundColor: "#000",
                }}
              >
                <source src={videoUrl} />
              </video>
            ) : displayImage ? (
              // Fallback: show image if we have one
              <img
                src={displayImage}
                alt={displayTitle}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  marginBottom: "1rem",
                }}
              />
            ) : null}
          </>
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

        {(body || caption) && (
          <p className="muted" style={{ margin: "0 0 0.75rem 0", lineHeight: "1.6" }}>
            {(body || caption || "").slice(0, 150)}
            {(body || caption || "").length > 150 ? "..." : ""}
          </p>
        )}

        <p className="muted" style={{ margin: 0, fontSize: "0.85rem", fontStyle: "italic" }}>
          by {displayAuthor}
        </p>
      </article>
    </Link>
  );
}