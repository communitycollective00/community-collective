export const PUBLIC_ROLE = "public" as const;
export const PROFESSIONAL_ROLE = "professional" as const;
export const PROFESSIONAL_PENDING_ROLE = "professional_pending" as const;
export const ADMIN_ROLE = "admin" as const;

export const LEGACY_PROFESSIONAL_ROLES = ["pending_creator", "verified_pending", "verified", "featured"] as const;
export const ALL_ROLE_OPTIONS = [PUBLIC_ROLE, PROFESSIONAL_PENDING_ROLE, PROFESSIONAL_ROLE, ADMIN_ROLE, ...LEGACY_PROFESSIONAL_ROLES] as const;

export type ProfileRole = (typeof ALL_ROLE_OPTIONS)[number];

export function isAdminRole(role?: string | null): role is typeof ADMIN_ROLE {
  return role === ADMIN_ROLE;
}

export function isProfessionalRole(role?: string | null): role is typeof PROFESSIONAL_ROLE | (typeof LEGACY_PROFESSIONAL_ROLES)[number] {
  return role === PROFESSIONAL_ROLE || LEGACY_PROFESSIONAL_ROLES.includes(role as any);
}

export function normalizeRole(role?: string | null): ProfileRole {
  if (!role) return PUBLIC_ROLE;
  if (role === ADMIN_ROLE) return ADMIN_ROLE;
  if (role === PROFESSIONAL_ROLE || role === PROFESSIONAL_PENDING_ROLE) return role;
  if (LEGACY_PROFESSIONAL_ROLES.includes(role as any)) return PROFESSIONAL_ROLE;
  return PUBLIC_ROLE;
}
