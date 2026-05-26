"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";
import { isAdminRole } from "../../lib/roles";

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/\+^])/g, "\\$1") + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

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
        let user = sessionData.session?.user;

        if (!user) {
          const access = getCookie("sb-access-token");
          const refresh = getCookie("sb-refresh-token");
          if (access && refresh) {
            const { data: setData, error: setErr } = await supabase.auth.setSession({
              access_token: access,
              refresh_token: refresh,
            });
            if (!setErr) {
              user = setData.session?.user;
            }
          }
        }

        if (!user) {
          router.push(`/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        const { data: profile, error: profileError } = await (supabase.from("profiles") as any)
          .select("id,role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        console.log("[AdminGuard] auth.user.id:", user.id, "profile.id:", (profile as any)?.id, "profile.role:", (profile as any)?.role);

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
