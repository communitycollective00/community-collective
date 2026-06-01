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
    let lastFetchedUserId: string | null = null; // Track which user's profile was last fetched to avoid duplicates

    async function fetchProfileForUser(u: any) {
      if (!u) return;

      // Try up to 2 times (1 retry) with backoff for resilience
      let attempt = 0;
      let lastErr: any = null;
      let lastData: any = null;

      while (attempt < 2) {
        attempt += 1;
        try {
          const fetchPromise = supabase.from("profiles").select("id,role,full_name,username").eq("id", u.id).maybeSingle();

          const result = await Promise.race([
            fetchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)),
          ] as any);

          const { data, error: fetchErr } = result as any;
          if (fetchErr) {
            lastErr = fetchErr;
            // try again if we have attempts left
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 300 * attempt));
              continue;
            }
            setError(fetchErr.message ?? String(fetchErr));
            setProfile(null);
            setRole(null);
            return;
          }

          if (!data) {
            // no profile found; allow one more retry before reporting a not-found error
            lastData = null;
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 300 * attempt));
              continue;
            }
            setError("Profile not found for this user.");
            setProfile(null);
            setRole(null);
            return;
          }

          // success
          lastFetchedUserId = u.id;
          setProfile(data as Profile);
          setRole((data as Profile).role ?? null);
          setError(null);
          return;
        } catch (e: any) {
          lastErr = e;
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 300 * attempt));
            continue;
          }
          setError(e?.message ?? String(e));
          setProfile(null);
          setRole(null);
          return;
        }
      }
    }

    let authResolved = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        function getCookie(name: string) {
          if (typeof document === "undefined") return undefined;
          try {
            const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/\+^])/g, "\\$1") + '=([^;]*)'));
            return match ? decodeURIComponent(match[1]) : undefined;
          } catch (e) {
            console.error(`[getCookie] failed to parse cookie ${name}:`, e);
            return undefined;
          }
        }

        const { data } = await supabase.auth.getSession();
        let s = data?.session ?? null;
        let u = s?.user ?? null;

        // If no in-memory session but server cookies exist (OAuth callback set them),
        // try to rehydrate the client session from the cookie tokens.
          console.log(`[AUTH-PROVIDER] init: getSession() returned session=${s ? "EXISTS" : "NULL"}, user=${u?.id ?? "NULL"}`);
        if (!s) {
          const accessToken = getCookie("sb-access-token");
          const refreshToken = getCookie("sb-refresh-token");
          if (accessToken && refreshToken) {
            try {
              // supabase.auth.setSession will populate the client session from tokens
              // when `persistSession: false` is used. This allows server-set cookies
              // to be used to restore client-side auth state securely.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore - types may vary across versions
              const setResp = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
              const setSessionData = setResp?.data?.session ?? null;
              if (setSessionData) {
                s = setSessionData;
                u = s.user ?? null;
              }
            } catch (e) {
              console.error("[init] Failed to rehydrate session from cookies", e);
            }
          }
        }
        if (!mounted) return;
        // Immediately set session/user so consumers can react synchronously.
        // Start profile fetch in background (do not await) to avoid blocking navigation.
        console.log(`[AUTH-PROVIDER] init complete: setting session=${s ? "EXISTS" : "NULL"}, user=${u?.id ?? "NULL"}`);
        setSession(s);
        setUser(u);
        if (u) {
          // fire-and-forget: fetch profile but don't block init
          void fetchProfileForUser(u);
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? String(e));
        }
      } finally {
        if (mounted) {
          // Only finalize loading after init completes.
          // onAuthStateChange will manage loading state from here.
          setLoading(false);
          authResolved = true;
        }
      }
    }

    init();

    // Subscribe to auth state changes. Guard the subscription in case the
    // client library returns an unexpected shape (avoid runtime destructuring
    // errors that crash the provider).
    let subscription: any = null;
    try {
      const resp = supabase.auth.onAuthStateChange(async (event, newSession) => {
        const u = newSession?.user ?? null;
        console.log(`[AUTH-PROVIDER] onAuthStateChange event: ${event}, session=${newSession ? "EXISTS" : "NULL"}, user=${u?.id ?? "NULL"}`);

        if (event === "SIGNED_OUT") {
          if (!authResolved) return;

          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
          setError(null);
          setLoading(false);

          return;
        }

        if (!newSession) {
          // Ignore transient auth events without a valid session.
          return;
        }

        // Preserve valid session state and only clear on explicit sign-out.
        setSession(newSession);
        setUser(u);

        if (event === "SIGNED_IN") {
          setLoading(true);
          console.log(`[AUTH-PROVIDER] SIGNED_IN event - user ${u?.id}, lastFetchedUserId=${lastFetchedUserId}`);
          // Skip profile fetch if we already fetched for this exact user in init()
          if (u?.id === lastFetchedUserId) {
            console.log(`[AUTH-PROVIDER] SIGNED_IN - profile already fetched for user ${u?.id}, skipping duplicate fetch`);
            setLoading(false);
          } else {
            console.log(`[AUTH-PROVIDER] SIGNED_IN event - fetching profile for user ${u?.id}`);
            await fetchProfileForUser(u);
            setLoading(false);
            console.log(`[AUTH-PROVIDER] SIGNED_IN - profile fetch complete`);
          }
          try {
            const currentPath = window.location.pathname;
            const authPaths = ["/", "/login", "/signup", "/auth/callback", "/get-access"];
            if (authPaths.includes(currentPath) || currentPath.startsWith("/auth/")) {
              window.location.href = "/dashboard";
            }
          } catch (e) {}
        } else {
          // For other auth state change events, ensure loading is finalized
          setLoading(false);
          if (u && u.id !== lastFetchedUserId) {
            await fetchProfileForUser(u);
          }
        }
      });

      subscription = resp?.data?.subscription;
        console.log(`[AUTH-PROVIDER] onAuthStateChange subscription set up`);
    } catch (e) {
      console.error("Failed to subscribe to auth state changes", e);
      subscription = null;
    }

    return () => {
      mounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseClient();
    
    // Clear app auth state immediately so UI shows logged-out right away
    try {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setError(null);
      setLoading(false);
    } catch (e) {}

    // Clear cookies related to auth / supabase synchronously
    try {
      // Set to epoch date to ensure deletion across all scenarios
      const deletionDate = new Date(0).toUTCString();
      document.cookie = `cc-auth=; Path=/; Expires=${deletionDate}; SameSite=Lax`;
      document.cookie = `sb-access-token=; Path=/; Expires=${deletionDate}; SameSite=Lax`;
      document.cookie = `sb-refresh-token=; Path=/; Expires=${deletionDate}; SameSite=Lax`;
    } catch (e) {}

    // Remove any leftover auth/profile keys from localStorage/sessionStorage
    try {
      const keyRe = /user|session|profile|role|admin|email|auth|sb-|supabase/i;
      if (typeof localStorage !== "undefined") {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (keyRe.test(key)) localStorage.removeItem(key);
        }
      }
      if (typeof sessionStorage !== "undefined") {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (!key) continue;
          if (keyRe.test(key)) sessionStorage.removeItem(key);
        }
      }
    } catch (e) {}

    // Ask Supabase to sign out (global scope if supported)
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - some versions accept an options object
      await supabase.auth.signOut({ scope: "global" });
    } catch (e) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }

    // Redirect to homepage
    try {
      window.location.href = "/";
    } catch (e) {}
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
