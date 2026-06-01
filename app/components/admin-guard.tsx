"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminRole } from "../../lib/roles";
import { useAuth } from "./auth-provider";
import { getSupabaseClient } from "../../lib/supabase";

const adminRoleCache = new Map<string, boolean>();
const adminRoleInFlight = new Map<string, Promise<boolean>>();

async function fetchAdminRole(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!data) {
    return false;
  }

  return data.role === "admin";
}

function getAdminRole(userId: string) {
  const cached = adminRoleCache.get(userId);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  const pending = adminRoleInFlight.get(userId);
  if (pending) {
    return pending;
  }

  const promise = fetchAdminRole(userId)
    .then((isAdmin) => {
      adminRoleCache.set(userId, isAdmin);
      adminRoleInFlight.delete(userId);
      return isAdmin;
    })
    .catch((error) => {
      adminRoleInFlight.delete(userId);
      throw error;
    });

  adminRoleInFlight.set(userId, promise);
  return promise;
}

export function useAdminGuard(nextPath: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, profile, role: providerRole, loading: authLoading, error: authError } = useAuth();
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

    if (authLoading) {
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

    // If both providerRole and profile are absent but auth provider didn't report an error,
    // wait a short grace period for the provider to populate profile/role (avoids duplicate fetches).
    if (providerRole === null && profile === null && authError === null) {
      // Wait up to 600ms for auth-provider to populate profile/role
      const waitMs = 600;
      let didWait = false;
      const start = Date.now();
      const waited = new Promise((res) => setTimeout(res, waitMs));
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        didWait = true;
        await waited;
        if (!active || !isMountedRef.current) return;
        console.log(`[ADMIN-GUARD] waited ${Date.now() - start}ms for provider role/profile to appear`);
        // If providerRole or profile resolved in that time, let effect re-run and handle it
        if (providerRole !== null || profile !== null) return;
        // otherwise proceed to fresh role check below
        try {
          const cachedAdminAfterWait = adminRoleCache.get(user.id);
          if (cachedAdminAfterWait !== undefined) return;
          // fall through to fetching fresh role
          // trigger re-render to continue
          // nothing to do here; the code below will run in this same effect
        } catch (e) {}
      })();
      if (didWait) return;
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

    const pending = adminRoleInFlight.get(user.id);
    if (pending) {
      pending
        .then((freshAdmin) => {
          if (!active || !isMountedRef.current) return;
          setIsAdmin(freshAdmin);
          setError(freshAdmin ? null : "Admin access required.");
          setLoading(false);
        })
        .catch(() => {
          if (!active || !isMountedRef.current) return;
          setError("Failed to verify admin access.");
          setIsAdmin(false);
          setLoading(false);
        });
      return;
    }

    getAdminRole(user.id)
      .then((freshAdmin) => {
        console.log(`[ADMIN-GUARD] admin role resolved from fresh lookup=${freshAdmin} for user=${user.id}`);
        if (!active || !isMountedRef.current) return;
        setIsAdmin(freshAdmin);
        setError(freshAdmin ? null : "Admin access required.");
      })
      .catch(() => {
        if (!active || !isMountedRef.current) return;
        setError("Failed to verify admin access.");
        setIsAdmin(false);
      })
      .finally(() => {
        if (!active || !isMountedRef.current) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [nextPath, user, profile, providerRole, authLoading, authError, router]);

  return { loading, error, isAdmin, setError };
}
