"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminRole } from "../../lib/roles";
import { useAuth } from "./auth-provider";
import { getSupabaseClient } from "../../lib/supabase";

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/\+^])/g, "\\$1") + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function useAdminGuard(nextPath: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, role: providerRole, loading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (authLoading) {
      // still checking; keep loading state
      return;
    }

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      setLoading(false);
      return;
    }

    // Check if providerRole indicates admin from cached auth context
    const isAdminFromProfile = isAdminRole(providerRole);
    if (isAdminFromProfile) {
      // Role is already confirmed as admin from provider
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // If not admin in provider role, re-fetch profile directly from Supabase
    // to check if role is admin (handles stale/cached state)
    async function recheckAdminRole() {
      try {
        const supabase = getSupabaseClient();
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          setError("Failed to verify admin access.");
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Admin access required.");
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if the fresh role from database is admin
        const freshRoleIsAdmin = data.role === "admin";
        if (freshRoleIsAdmin) {
          setIsAdmin(true);
          setError(null);
        } else {
          setError("Admin access required.");
          setIsAdmin(false);
        }
        setLoading(false);
      } catch (err: any) {
        setError("Failed to verify admin access.");
        setIsAdmin(false);
        setLoading(false);
      }
    }

    recheckAdminRole();
  }, [nextPath, user, providerRole, authLoading]);

  return { loading, error, isAdmin, setError };
}
