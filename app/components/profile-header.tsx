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
      <div className="page-search-row">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="page-input"
          style={{ flex: 1 }}
        />
      </div>

      {showFilters && filters && filters.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={filter.onClick}
              className={filter.active ? "gold-btn" : "page-input"}
              style={{
                padding: "0.5rem 1rem",
                background: filter.active ? "var(--gold)" : "var(--s1)",
                border: `1px solid ${filter.active ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "12px",
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
    description?: string | null;
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
    <div className="page-panel" style={{ overflow: "hidden", marginBottom: "2rem", borderRadius: "24px" }}>
      {profile.banner_url && (
        <div
          className="profile-banner"
          style={{
            backgroundImage: `url(${profile.banner_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div style={{ padding: "2rem 1.5rem" }}>
        <div className="profile-header">
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <img
              src={profile.avatar_url || fallbackAvatar}
              alt={displayName}
              className="profile-avatar"
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "2rem" }}>{displayName}</h1>
                {isProfessional && profile.is_approved && <span title="Verified Professional">✓</span>}
                {profile.is_featured && <span title="Featured">⭐</span>}
              </div>
              {profile.industry && (
                <p className="muted" style={{ margin: "0.5rem 0 0" }}>
                  {profile.industry}
                  {profile.location && ` • ${profile.location}`}
                </p>
              )}
              {profile.bio && (
                <p style={{ margin: "1rem 0 0", lineHeight: 1.6, maxWidth: "720px" }}>{profile.bio}</p>
              )}
              {profile.description && (
                <p style={{ margin: "1rem 0 0", lineHeight: 1.6, maxWidth: "720px", opacity: 0.9 }}>
                  {profile.description}
                </p>
              )}
              {(profile.website || profile.instagram || profile.twitter || profile.linkedin) && (
                <div className="profile-meta">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile-link">
                      🌐 Website
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                      📸 Instagram
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                      𝕏 Twitter
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                      💼 LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
