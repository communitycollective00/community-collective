"use client";

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

// Categories that are informational ("open this") rather than something you
// formally apply to. Adjust this list as you add real job/mentorship posts.
const OPEN_CATEGORIES = ["Housing Counseling", "Start a Business", "Unions & Building Trades"];

export default function OpportunityCard({
  id,
  title,
  organization,
  description,
  location,
  category,
  apply_link,
  deadline,
  featured,
}: OpportunityCardProps) {
  const displayTitle = title || "Untitled Opportunity";
  const displayOrg = organization || "Organization";
  const actionLabel = category && OPEN_CATEGORIES.includes(category) ? "Open" : "Apply";

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

  const isExpired = deadline && new Date(deadline) < new Date();

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!apply_link) return;
    if (apply_link.startsWith("mailto:")) {
      window.location.href = apply_link;
    } else {
      window.open(apply_link, "_blank");
    }
  };

  return (
    <article className="submission-item" style={{ position: "relative" }}>
      {featured && (
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
      <div style={{ paddingTop: featured ? "0.5rem" : 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {category && (
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#c9a84c",
                  border: "0.5px solid rgba(201,168,76,0.45)",
                  borderRadius: "999px",
                  padding: "0.18rem 0.6rem",
                  marginBottom: "0.55rem",
                }}
              >
                {category}
              </span>
            )}
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.12rem", lineHeight: 1.25 }}>{displayTitle}</h3>
            <p className="muted" style={{ margin: "0 0 0.7rem 0", fontSize: "0.9rem" }}>
              {displayOrg}
            </p>
            {description && (
              <p className="muted" style={{ margin: "0 0 0.75rem 0", lineHeight: "1.5" }}>
                {description.slice(0, 150)}
                {description.length > 150 ? "..." : ""}
              </p>
            )}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {location && (
                <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                  {"\u{1F4CD}"} {location}
                </p>
              )}
              {deadline && (
                <p className="muted" style={{ margin: 0, fontSize: "0.9rem", color: isExpired ? "var(--red)" : "inherit" }}>
                  {isExpired ? "\u274C Expired" : `\u{1F4C5} ${formatDate(deadline)}`}
                </p>
              )}
            </div>
          </div>
          {apply_link && !isExpired && (
            <button onClick={handleApply} className="gold-btn" style={{ fontSize: "0.9rem", padding: "0.6rem 1rem", whiteSpace: "nowrap" }}>
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}