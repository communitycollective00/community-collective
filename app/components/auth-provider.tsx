"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

type Profile = {
  id: string;
  role: string | null;
  full_name?: string | null;
  username?: string | null;
};

type AuthContextValue = {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    async function fetchProfileForUser(u: any) {
      if (!u) return;

      // Try once, then retry one time before surfacing an error.
      let attempt = 0;
      let lastErr: any = null;
      let lastData: any = null;

      while (attempt < 2) {
        attempt += 1;
        try {
          const fetchPromise = supabase.from("profiles").select("id,role,full_name,username").eq("id", u.id).maybeSingle();

          const result = await Promise.race([
            fetchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)),
          ] as any);

          const { data, error: fetchErr } = result as any;
          if (fetchErr) {
            lastErr = fetchErr;
            // try again once
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 400));
              continue;
            }
            setError(fetchErr.message ?? String(fetchErr));
            setProfile(null);
            setRole(null);
            return;
          }

          if (!data) {
            // no profile found; allow one retry before reporting a not-found error
            lastData = null;
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 400));
              continue;
            }
            setError("Profile not found for this user.");
            setProfile(null);
            setRole(null);
            return;
          }

          // success
          setProfile(data as Profile);
          setRole((data as Profile).role ?? null);
          setError(null);
          return;
        } catch (e: any) {
          lastErr = e;
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }
          setError(e?.message ?? String(e));
          setProfile(null);
          setRole(null);
          return;
        }
      }
    }

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await supabase.auth.getSession();
        const s = data?.session ?? null;
        const u = s?.user ?? null;
        if (!mounted) return;
        // Immediately set session/user so consumers can react synchronously
        setSession(s);
        setUser(u);
        if (u) {
          await fetchProfileForUser(u);
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      const u = newSession?.user ?? null;
      // Set session/user immediately on change so UI updates fast
      setSession(newSession ?? null);
      setUser(u);

      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRole(null);
        setError(null);
        setLoading(false);
      } else if (event === "SIGNED_IN") {
        setLoading(true);
        await fetchProfileForUser(u);
        setLoading(false);
        try {
          const currentPath = window.location.pathname;
          const authPaths = ["/", "/login", "/signup", "/auth/callback", "/get-access"];
          if (authPaths.includes(currentPath) || currentPath.startsWith("/auth/")) {
            window.location.href = "/dashboard";
          }
        } catch (e) {}
      }

      // Keep cookie marker for middleware behavior (non-authoritative)
      try {
        document.cookie = `cc-auth=${newSession ? "1" : "0"}; Path=/; Max-Age=${newSession ? 60 * 60 * 24 * 7 : 0}; SameSite=Lax`;
      } catch (e) {}
    });

    return () => {
      mounted = false;
      try {
        subscription.unsubscribe();
      } catch {}
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseClient();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore sign-out failures and continue clearing local state
    }

    // Clear local markers
    try {
      document.cookie = "cc-auth=0; Path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "sb-access-token=; Path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax";
    } catch (e) {}

    // Clear state immediately
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setError(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
