"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminRole } from "../../lib/roles";
import { useAuth } from "./auth-provider";

const adminRoleCache = new Map<string, boolean>();

export function useAdminGuard(nextPath: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, profile, role: providerRole, loading: authLoading, profileLoading, error: authError } = useAuth();
  const isMountedRef = useRef(true);
  const effectiveRole = providerRole ?? profile?.role ?? null;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // If auth is still initializing, only block when we don't yet have a user.
    // If a user session is already present, proceed — role checks or cached role
    // can determine admin access without waiting for profile retry/backoff.
    if (authLoading && !user) {
      return;
    }

    console.log(`[ADMIN-GUARD] auth resolved for user=${user?.id ?? "unknown"}, authLoading=${authLoading}`);

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      if (active && isMountedRef.current) {
        setLoading(false);
      }
      return;
    }

    if (isAdminRole(providerRole)) {
      adminRoleCache.set(user.id, true);
      console.log(`[ADMIN-GUARD] providerRole available and admin for user=${user.id}`);
      if (active && isMountedRef.current) {
        setIsAdmin(true);
        setLoading(false);
      }
      return;
    }

    if (providerRole !== null) {
      const resolvedAdmin = isAdminRole(effectiveRole);
      adminRoleCache.set(user.id, resolvedAdmin);
      console.log(`[ADMIN-GUARD] admin role resolved from effectiveRole=${effectiveRole} for user=${user.id}`);
      if (active && isMountedRef.current) {
        setError("Admin access required.");
        setIsAdmin(false);
        setLoading(false);
      }
      return;
    }

    const cachedAdmin = adminRoleCache.get(user.id);
    if (cachedAdmin !== undefined) {
      console.log(`[ADMIN-GUARD] admin role resolved from cache=${cachedAdmin} for user=${user.id}`);
      if (active && isMountedRef.current) {
        setIsAdmin(cachedAdmin);
        setError(cachedAdmin ? null : "Admin access required.");
        setLoading(false);
      }
      return;
    }

    // If the auth provider is still fetching profile, wait for it to complete.
    if (profileLoading) {
      console.log(`[ADMIN-GUARD] waiting for auth-provider profile to finish for user=${user.id}`);
      return;
    }

    // If provider/profile resolved but no cached admin, derive from profile if available
    if (profile) {
      const freshAdmin = profile.role === "admin";
      adminRoleCache.set(user.id, freshAdmin);
      console.log(`[ADMIN-GUARD] admin role resolved from profile=${freshAdmin} for user=${user.id}`);
      if (active && isMountedRef.current) {
        setIsAdmin(freshAdmin);
        setError(freshAdmin ? null : "Admin access required.");
        setLoading(false);
      }
      return;
    }

    // No profile and not loading -> not an admin
    if (active && isMountedRef.current) {
      setError("Admin access required.");
      setIsAdmin(false);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [nextPath, user, profile, providerRole, authLoading, authError, router]);

  return { loading, error, isAdmin, setError };
}
