export const PROFILE_COLUMNS = [
  "id",
  "email",
  "full_name",
  "username",
  "bio",
  "description",
  "category",
  "industry",
  "role",
  "location",
  "city",
  "state",
  "website",
  "instagram",
  "twitter",
  "linkedin",
  "tiktok",
  "youtube",
  "looking_for",
  "can_offer",
  "avatar_url",
  "banner_url",
  "featured_status",
  "is_featured",
  "is_approved",
  "onboarding_completed",
  "profile_completed",
  "created_at",
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
    profile.full_name,
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

export function calculateProfileCompletion(profile: Record<string, unknown>): { completed: number; total: number; percentage: number; missingFields: string[] } {
  const completionFields = [
    { key: "full_name", label: "Full Name" },
    { key: "username", label: "Username" },
    { key: "industry", label: "Industry" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "bio", label: "Short Bio" },
    { key: "description", label: "Full Description" },
    { key: "website", label: "Website" },
    { key: "avatar_url", label: "Avatar" },
  ];

  const missingFields: string[] = [];
  let completed = 0;

  completionFields.forEach(({ key, label }) => {
    const value = profile[key];
    if (value && String(value).trim()) {
      completed++;
    } else {
      missingFields.push(label);
    }
  });

  return {
    completed,
    total: completionFields.length,
    percentage: Math.round((completed / completionFields.length) * 100),
    missingFields,
  };
}
