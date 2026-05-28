"use client";

import { useState } from "react";

export function SearchHeader({
  onSearch,
  placeholder = "Search...",
  showFilters = false,
  filters,
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  filters?: { label: string; value: string; active: boolean; onClick: () => void }[];
}) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            background: "var(--s1)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "inherit",
            fontSize: "1rem",
          }}
        />
      </div>

      {showFilters && filters && filters.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={filter.onClick}
              className={filter.active ? "gold-btn" : ""}
              style={{
                padding: "0.5rem 1rem",
                background: filter.active ? "var(--gold)" : "var(--s1)",
                border: `1px solid ${filter.active ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "4px",
                color: filter.active ? "var(--s0)" : "inherit",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileHeader({
  profile,
}: {
  profile: {
    full_name?: string | null;
    username?: string | null;
    bio?: string | null;
    industry?: string | null;
    location?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    is_approved?: boolean;
    is_featured?: boolean;
    role?: string | null;
    website?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
  };
}) {
  const displayName = profile.full_name || profile.username || "User";
  const isProfessional =
    profile.role === "professional" ||
    profile.role === "professional_pending" ||
    profile.role === "admin";

  const fallbackAvatar = `https://placehold.co/160x160/1a1408/f4cf70?text=${encodeURIComponent(displayName.split(" ")[0]?.[0] || "C")}`;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--s1), var(--s2))",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "2rem",
        border: "1px solid var(--border)",
      }}
    >
      {profile.banner_url && (
        <div
          style={{
            width: "100%",
            height: "200px",
            backgroundImage: `url(${profile.banner_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          <img
            src={profile.avatar_url || fallbackAvatar}
            alt={displayName}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "4px",
              objectFit: "cover",
              border: "2px solid var(--gold)",
              marginTop: profile.banner_url ? "-80px" : 0,
              position: "relative",
              zIndex: 1,
            }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "2rem" }}>
                {displayName}
              </h1>
              {isProfessional && profile.is_approved && (
                <span title="Verified Professional" style={{ fontSize: "1.5rem" }}>
                  ✓
                </span>
              )}
              {profile.is_featured && (
                <span title="Featured" style={{ fontSize: "1.5rem" }}>
                  ⭐
                </span>
              )}
            </div>

            {profile.industry && (
              <p className="muted" style={{ margin: "0.25rem 0" }}>
                {profile.industry}
                {profile.location && ` • ${profile.location}`}
              </p>
            )}

            {profile.bio && (
              <p style={{ margin: "0.75rem 0", lineHeight: "1.5", maxWidth: "700px" }}>
                {profile.bio}
              </p>
            )}

            {(profile.website || profile.instagram || profile.twitter || profile.linkedin) && (
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="gold-link">
                    🌐 Website
                  </a>
                )}
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-link"
                  >
                    📸 Instagram
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-link"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gold-link"
                  >
                    💼 LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
