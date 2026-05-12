export const PROFILE_COLUMNS = [
  "id",
  "full_name",
  "username",
  "bio",
  "city",
  "state",
  "industry",
  "website",
  "instagram",
  "twitter",
  "linkedin",
  "avatar_url",
  "social_links",
  "services_offered",
  "description",
  "role",
  "location",
  "featured_requested",
  "featured_reason",
  "professional_name",
  "phone",
  "credentials",
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
