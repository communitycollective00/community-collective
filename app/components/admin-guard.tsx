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

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      if (active && isMountedRef.current) {
        setLoading(false);
      }
      return;
    }

    if (isAdminRole(providerRole)) {
      adminRoleCache.set(user.id, true);
      if (active && isMountedRef.current) {
        setIsAdmin(true);
        setLoading(false);
      }
      return;
    }

    if (providerRole !== null) {
      adminRoleCache.set(user.id, false);
      if (active && isMountedRef.current) {
        setError("Admin access required.");
        setIsAdmin(false);
        setLoading(false);
      }
      return;
    }

    if (profile === null && authError === null) {
      return;
    }

    const cachedAdmin = adminRoleCache.get(user.id);
    if (cachedAdmin !== undefined) {
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
