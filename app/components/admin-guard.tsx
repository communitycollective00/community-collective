"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminRole } from "../../lib/roles";
import { useAuth } from "./auth-provider";

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

    const isAdminFromProfile = isAdminRole(providerRole);
    if (!isAdminFromProfile) {
      setError("Admin access required.");
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [nextPath, user, providerRole, authLoading]);

  return { loading, error, isAdmin, setError };
}
