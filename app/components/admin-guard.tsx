"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";
import { isAdminRole } from "../../lib/roles";

export function useAdminGuard(nextPath: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (!user) {
          router.push(`/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const isAdminFromProfile = isAdminRole(profile?.role);
        if (!isAdminFromProfile) {
          // Redirect non-admins away from the admin area and show a clear message on the dashboard.
          router.push(`/dashboard?admin_required=1`);
          return;
        }

        setIsAdmin(true);
      } catch (loadError: any) {
        setError(loadError?.message ?? "Failed to verify admin access.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [nextPath]);

  return { loading, error, isAdmin, setError };
}
