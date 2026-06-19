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
      <article className={`dir-tile${is_featured ? " dir-tile--featured" : ""}`}>
        <div className="dir-tile-img">
          {avatar_url ? (
            <img src={avatar_url} alt={displayName} className="dir-tile-photo" />
          ) : (
            <span className="dir-tile-monogram">{(displayName || "CC").split(" ")[0]?.[0] || "C"}</span>
          )}
          {industry && <span className="dir-tile-badge">{industry}</span>}
          {is_featured && <span className="dir-tile-ribbon">★ FEATURED</span>}
        </div>
        <div className="dir-tile-body">
          <h3 className="dir-tile-name">
            {displayName}
            {is_approved && <span className="dir-tile-verified" title="Verified">✓</span>}
          </h3>
          {location && (
            <p className="dir-tile-loc">📍 {location}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
