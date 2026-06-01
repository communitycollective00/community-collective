"use client";

import { useEffect, useRef, useState } from "react";
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

  const { user, profile, role: providerRole, loading: authLoading, error: authError } = useAuth();
  const lastCheckedUserRef = useRef<string | null>(null);
  const pendingRecheckRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (authLoading) {
      // still checking auth/session state; keep loading
      return;
    }

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      setLoading(false);
      return;
    }

    const isAdminFromProfile = isAdminRole(providerRole);
    if (isAdminFromProfile) {
      lastCheckedUserRef.current = user.id;
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    if (providerRole !== null) {
      // Cached provider role is available and user is not an admin.
      setError("Admin access required.");
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // If the auth provider is still resolving the profile for the current user,
    // wait for that resolution rather than issuing a duplicate profile query.
    if (profile === null && authError === null) {
      return;
    }

    if (lastCheckedUserRef.current === user.id) {
      setLoading(false);
      return;
    }

    if (pendingRecheckRef.current) {
      return;
    }

    async function recheckAdminRole() {
      pendingRecheckRef.current = true;
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
          return;
        }

        if (!data) {
          setError("Admin access required.");
          setIsAdmin(false);
          return;
        }

        const freshRoleIsAdmin = data.role === "admin";
        if (freshRoleIsAdmin) {
          setIsAdmin(true);
          setError(null);
        } else {
          setError("Admin access required.");
          setIsAdmin(false);
        }
        lastCheckedUserRef.current = user.id;
      } catch (err: any) {
        setError("Failed to verify admin access.");
        setIsAdmin(false);
      } finally {
        pendingRecheckRef.current = false;
        setLoading(false);
      }
    }

    recheckAdminRole();
  }, [nextPath, user, profile, providerRole, authLoading, authError]);

  return { loading, error, isAdmin, setError };
}
