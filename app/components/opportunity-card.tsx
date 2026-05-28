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

  const isExpired =
    deadline && new Date(deadline) < new Date() ? true : false;

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    if (apply_link) {
      if (apply_link.startsWith("mailto:")) {
        window.location.href = apply_link;
      } else {
        window.open(apply_link, "_blank");
      }
    }
  };

  return (
    <article className="submission-item">
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
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}>
              {displayTitle}
            </h3>
            <p className="muted" style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem" }}>
              {displayOrg}
              {category && ` • ${category}`}
            </p>

            {description && (
              <p className="muted" style={{ margin: "0 0 0.75rem 0", lineHeight: "1.4" }}>
                {description.slice(0, 120)}
                {description.length > 120 ? "..." : ""}
              </p>
            )}

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {location && (
                <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                  📍 {location}
                </p>
              )}
              {deadline && (
                <p
                  className="muted"
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: isExpired ? "var(--red)" : "inherit",
                  }}
                >
                  {isExpired ? "❌ Expired" : `📅 ${formatDate(deadline)}`}
                </p>
              )}
            </div>
          </div>

          {apply_link && !isExpired && (
            <button
              onClick={handleApply}
              className="gold-btn"
              style={{ fontSize: "0.9rem", padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
