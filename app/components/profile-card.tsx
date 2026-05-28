"use client";

import Link from "next/link";

type ProfileCardProps = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
  industry: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_featured?: boolean;
  is_approved?: boolean;
  city?: string | null;
  state?: string | null;
};

export default function ProfileCard({
  id,
  full_name,
  username,
  role,
  industry,
  bio,
  avatar_url,
  is_featured,
  is_approved,
  city,
  state,
}: ProfileCardProps) {
  const displayName = full_name || username || "Unnamed";
  const fallbackAvatar = `https://placehold.co/120x120/1a1408/f4cf70?text=${encodeURIComponent((displayName || "CC").split(" ")[0]?.[0] || "C")}`;

  const location = [city, state].filter(Boolean).join(", ");
  const isProfessional =
    role === "professional" || role === "professional_pending" || role === "admin";

  return (
    <Link href={`/directory/${username || id}`}>
      <article
        className="submission-item"
        style={{
          cursor: "pointer",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {is_featured && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, var(--gold), var(--gold2))",
              zIndex: 1,
            }}
          />
        )}

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <img
            src={avatar_url || fallbackAvatar}
            alt={displayName}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "4px",
              objectFit: "cover",
              border: "1px solid var(--border)",
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>{displayName}</h3>
              {is_approved && isProfessional && (
                <span
                  title="Verified Professional"
                  style={{
                    fontSize: "1.2rem",
                    display: "inline-block",
                  }}
                >
                  ✓
                </span>
              )}
            </div>

            {industry && (
              <p className="muted" style={{ margin: "0.25rem 0" }}>
                {industry}
                {location && ` • ${location}`}
              </p>
            )}

            {bio && (
              <p className="muted" style={{ margin: "0.5rem 0 0", lineHeight: "1.4" }}>
                {bio.slice(0, 100)}
                {bio.length > 100 ? "..." : ""}
              </p>
            )}

            {is_featured && (
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.85rem",
                  color: "var(--gold)",
                  fontWeight: "600",
                }}
              >
                ⭐ Featured
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
