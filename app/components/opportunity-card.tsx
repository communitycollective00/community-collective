"use client";

import { useState } from "react";

type OpportunityCardProps = {
  id: string;
  title: string | null;
  organization: string | null;
  description: string | null;
  location: string | null;
  category: string | null;
  apply_link?: string | null;
  deadline?: string | null;
  featured?: boolean;
};

// Categories that are informational ("open this") rather than a formal apply.
const OPEN_CATEGORIES = ["Housing Counseling", "Start a Business", "Unions & Building Trades"];

// Faint watermark icon per category. Matches the icon vocabulary on the
// Opportunities page. Falls back to a diamond for unknown categories.
const CATEGORY_ICON: Record<string, string> = {
  "Rental Assistance": "\u{1F3E0}",
  "Utility Assistance": "\u{1F4A1}",
  "First-Time Homebuyer": "\u{1F511}",
  "Housing Counseling": "\u{1F9ED}",
  "Unions & Building Trades": "\u{1F6E0}\uFE0F",
  "Apprenticeships": "\u{1F4D0}",
  "Land Banks": "\u{1F3DA}\uFE0F",
  "Start a Business": "\u{1F4BC}",
};

export default function OpportunityCard({
  title,
  organization,
  description,
  location,
  category,
  apply_link,
  deadline,
  featured,
}: OpportunityCardProps) {
  const [hovered, setHovered] = useState(false);

  const displayTitle = title || "Untitled Opportunity";
  const displayOrg = organization || "Organization";
  const actionLabel = category && OPEN_CATEGORIES.includes(category) ? "Open" : "Apply";
  const icon = (category && CATEGORY_ICON[category]) || "\u2726";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const isExpired = deadline ? new Date(deadline) < new Date() : false;

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!apply_link) return;
    if (apply_link.startsWith("mailto:")) window.location.href = apply_link;
    else window.open(apply_link, "_blank");
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "rgba(20,16,9,0.92)",
        border: `1px solid ${
          featured ? "rgba(201,168,76,0.5)" : hovered ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.22)"
        }`,
        borderRadius: 14,
        padding: "1.1rem",
        overflow: "hidden",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.45)" : "none",
        transition: "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
      }}
    >
      {featured && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, var(--gold), var(--gold2))",
            zIndex: 2,
          }}
        />
      )}

      {/* faint category watermark */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -14,
          right: -6,
          fontSize: 74,
          lineHeight: 1,
          opacity: 0.07,
          transform: hovered ? "scale(1.08)" : "none",
          transition: "transform .3s ease",
          pointerEvents: "none",
        }}
      >
        {icon}
      </span>

      <div style={{ position: "relative", minWidth: 0 }}>
        {category && (
          <span
            style={{
              display: "inline-block",
              fontSize: "0.68rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#1a1408",
              background: "#c9a84c",
              borderRadius: 999,
              padding: "0.2rem 0.65rem",
              marginBottom: "0.6rem",
              fontWeight: 600,
            }}
          >
            {category}
          </span>
        )}

        <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.12rem", lineHeight: 1.25, color: "#fff" }}>
          {displayTitle}
        </h3>

        <p className="muted" style={{ margin: "0 0 0.65rem 0", fontSize: "0.9rem" }}>
          {displayOrg}
        </p>

        {description && (
          <p className="muted" style={{ margin: "0 0 0.9rem 0", lineHeight: 1.5, fontSize: "0.9rem" }}>
            {description.slice(0, 150)}
            {description.length > 150 ? "..." : ""}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", minWidth: 0 }}>
            {location && (
              <span className="muted" style={{ fontSize: "0.85rem" }}>
                {"\u{1F4CD}"} {location}
              </span>
            )}
            {deadline && (
              <span
                className="muted"
                style={{ fontSize: "0.85rem", color: isExpired ? "var(--red)" : "inherit" }}
              >
                {isExpired ? "\u274C Expired" : `\u{1F4C5} ${formatDate(deadline)}`}
              </span>
            )}
          </div>

          {apply_link && !isExpired && (
            <button
              onClick={handleApply}
              style={{
                flexShrink: 0,
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#1a1408",
                background: "#c9a84c",
                border: "none",
                borderRadius: 999,
                padding: "0.5rem 1rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {actionLabel} {"\u2192"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}