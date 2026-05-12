export const PROFILE_COLUMNS = [
  "id",
  "email",
  "full_name",
  "display_name",
  "username",
  "bio",
  "description",
  "category",
  "industry",
  "location",
  "city",
  "state",
  "website",
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "linkedin",
  "avatar_url",
  "banner_url",
  "featured_status",
  "is_featured",
  "is_approved",
  "profile_completed",
  "professional_name",
  "phone",
  "credentials",
  "featured_reason",
  "services_offered",
  "updated_at",
] as const;

type ProfileColumn = (typeof PROFILE_COLUMNS)[number];

export function filterProfilePayload(payload: Record<string, unknown>): Partial<Record<ProfileColumn, unknown>> {
  return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => PROFILE_COLUMNS.includes(key as ProfileColumn) && value !== undefined)
  ) as Partial<Record<ProfileColumn, unknown>>;
}

export function fallbackAvatar(name?: string | null) {
  const initials = (name || "CC").split(" ").filter(Boolean).slice(0, 2).map((v) => v[0]?.toUpperCase()).join("") || "CC";
  return `https://placehold.co/160x160/1a1408/f4cf70?text=${encodeURIComponent(initials)}`;
}

export function computeProfileCompleted(profile: Record<string, unknown>) {
  const fields = [
    profile.display_name,
    profile.username,
    profile.bio,
    profile.category ?? profile.industry,
    profile.city,
    profile.state,
    profile.website,
    profile.instagram,
    profile.twitter,
    profile.linkedin,
    profile.description,
    profile.avatar_url,
  ];
  return fields.every((v) => Boolean(v && String(v).trim()));
}
