import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileSeed = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  username?: string | null;
  role?: string | null;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createUsernamePlaceholder(userId: string) {
  return `user-${userId.replace(/-/g, "").slice(0, 8)}`;
}

export async function upsertProfileWithRetry(
  supabase: SupabaseClient,
  seed: ProfileSeed,
  retries = 2
) {
  const payload = {
    id: seed.id,
    email: seed.email ?? null,
    full_name: seed.fullName?.trim() || (seed.email?.split("@")[0] ?? ""),
    username: seed.username?.trim() || createUsernamePlaceholder(seed.id),
    role: seed.role || "member",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { error } = await (supabase.from("profiles") as any).upsert(payload, { onConflict: "id" });
    if (!error) return;
    lastError = error;
    if (attempt < retries) await wait(250 * (attempt + 1));
  }

  throw lastError;
}
