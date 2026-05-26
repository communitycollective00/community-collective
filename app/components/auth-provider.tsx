"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

type AuthContextValue = {
  isAuthed: boolean;
  role: string | null;
  userId: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    try {
      const match = document.cookie.match(/cc-auth=1/);
      return Boolean(match);
    } catch {
      return false;
    }
  });
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    let mounted = true;

    function getCookie(name: string) {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/\\+^])/g, '\\$1') + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : undefined;
    }

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        let user = data.session?.user;

        // If no session found client-side, try hydrating from tokens set as cookies by the auth callback.
        if (!user) {
          const access = getCookie('sb-access-token');
          const refresh = getCookie('sb-refresh-token');
          if (access && refresh) {
            try {
              const { data: setData, error: setErr } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
              if (!setErr) {
                user = setData.session?.user;
              }
            } catch (e) {
              console.error('[AuthProvider] setSession failed', e);
            }
          }
        }

        if (!mounted) return;
        setIsAuthed(Boolean(user));
        setUserId(user?.id ?? null);
        if (user) {
          try {
            const { data: profile } = await supabase.from("profiles").select("id,role").eq("id", user.id).maybeSingle();
            console.log("[AuthProvider] auth.user.id:", user.id, "profile.id:", (profile as any)?.id, "profile.role:", (profile as any)?.role);
            setRole((profile as any)?.role ?? null);
          } catch (err) {
            console.error("[AuthProvider] profile fetch failed", err);
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("[AuthProvider] getSession failed", err);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setIsAuthed(Boolean(user));
      setUserId(user?.id ?? null);
      if (user) {
        try {
          const { data: profile } = await supabase.from("profiles").select("id,role").eq("id", user.id).maybeSingle();
          console.log("[AuthProvider] auth.user.id:", user.id, "profile.id:", (profile as any)?.id, "profile.role:", (profile as any)?.role);
          setRole((profile as any)?.role ?? null);
        } catch (err) {
          console.error("[AuthProvider] profile fetch failed", err);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      document.cookie = `cc-auth=${session ? "1" : "0"}; Path=/; Max-Age=${session ? 60 * 60 * 24 * 7 : 0}; SameSite=Lax`;
    });

    return () => {
      mounted = false;
      try {
        subscription.unsubscribe();
      } catch {}
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[AuthProvider] signOut failed", err);
    }
    // Clear cookie-based tokens and cc-auth marker
    document.cookie = "cc-auth=0; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "sb-access-token=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax";
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ isAuthed, role, userId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
