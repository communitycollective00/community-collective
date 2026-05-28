"use client";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid var(--border)",
          borderTop: "2px solid var(--gold)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 1rem",
        }}
      />
      <p className="muted">{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon = "📭",
  action,
}: {
  title: string;
  message: string;
  icon?: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{title}</h3>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        {message}
      </p>
      {action && (
        <a href={action.href} className="gold-btn">
          {action.label}
        </a>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "Unable to load. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{title}</h3>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="gold-btn">
          Try Again
        </button>
      )}
    </div>
  );
}
