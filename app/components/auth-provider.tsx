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

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const user = data.session?.user;
      setIsAuthed(Boolean(user));
      setUserId(user?.id ?? null);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setRole((profile as any)?.role ?? null);
      } else {
        setRole(null);
      }
    }).catch((err) => {
      console.error("[AuthProvider] getSession failed", err);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setIsAuthed(Boolean(user));
      setUserId(user?.id ?? null);
      if (user) {
        try {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
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
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await getSupabaseClient().auth.signOut();
    } catch (err) {
      console.error("[AuthProvider] signOut failed", err);
    }
    document.cookie = "cc-auth=0; Path=/; Max-Age=0; SameSite=Lax";
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
