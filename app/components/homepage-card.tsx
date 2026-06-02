"use client";

import Link from "next/link";

export type HomepageCardProps = {
  title: string;
  subtitle?: string;
  image?: string;
  city?: string;
  role?: string;
  description?: string;
  link?: string;
  className?: string;
};

export function HomepageCard({
  title,
  subtitle,
  image,
  city,
  role,
  description,
  link,
  className = "",
}: HomepageCardProps) {
  const cardClasses = ["homepage-card", className, image ? "homepage-card--with-image" : ""].filter(Boolean).join(" ");

  const content = (
    <div className={cardClasses}>
      {image ? <img className="homepage-card-image" src={image} alt={title} /> : null}
      <div className="homepage-card-content">
        {subtitle ? <p className="homepage-card-subtitle">{subtitle}</p> : null}
        <h3 className="homepage-card-title">{title}</h3>
        {(role || city) ? (
          <p className="homepage-card-meta">
            {role}
            {role && city ? " · " : ""}
            {city}
          </p>
        ) : null}
        {description ? <p className="homepage-card-description">{description}</p> : null}
      </div>
    </div>
  );

  return link ? (
    <Link href={link} className="homepage-card-link">
      {content}
    </Link>
  ) : (
    content
  );
}
