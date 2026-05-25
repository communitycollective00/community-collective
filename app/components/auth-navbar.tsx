"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { isAdminRole } from "../../lib/roles";

export default function AuthNavbar() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      setIsAuthed(Boolean(user));
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setRole((profile as any)?.role ?? null);
      } else {
        setRole(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      setIsAuthed(Boolean(user));
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        setRole((profile as any)?.role ?? null);
      } else {
        setRole(null);
      }
      document.cookie = `cc-auth=${session ? "1" : "0"}; Path=/; Max-Age=${
        session ? 60 * 60 * 24 * 7 : 0
      }; SameSite=Lax`;
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await getSupabaseClient().auth.signOut();
    document.cookie = "cc-auth=0; Path=/; Max-Age=0; SameSite=Lax";
    window.location.href = "/login";
  };

  return (
    <nav className="premium-nav">
      <div className="premium-brand">Community Collective</div>
      <div className="premium-links">
        <Link href="/">Home</Link>
        <Link href="/voices">Voices</Link>
        <Link href="/opportunities">Opportunities</Link>
        <Link href="/directory">Directory</Link>
        <Link href="/pathways">Pathways</Link>
        <Link href="/get-access" className="gold-link">Get Access</Link>
        {isAuthed ? (
          <>
            {isAdminRole(role) ? <Link href="/admin">Admin</Link> : null}
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <button onClick={logout} className="gold-btn">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup" className="gold-link">Sign up</Link>
            <Link href="/apply">Apply</Link>
          </>
        )}
      </div>
    </nav>
  );
}
