"use client";

import Link from "next/link";
import { isAdminRole } from "../../lib/roles";
import { useAuth } from "./auth-provider";

export default function AuthNavbar() {
  const { user, role, loading, error, signOut } = useAuth();
  const isAuthed = Boolean(user);
  console.log("[AuthNavbar] userId:", user?.id, "role:", role, "loading:", loading, "error:", error);

  return (
    <nav className="premium-nav">
      <div className="premium-brand">Community Collective</div>
      <div className="premium-links">
        <Link href="/">Home</Link>
        <Link href="/voices">Voices</Link>
        <Link href="/opportunities">Opportunities</Link>
        <Link href="/directory">Directory</Link>
        {isAuthed ? (
          <>
            {isAdminRole(role) ? <Link href="/admin">Admin</Link> : null}
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <button onClick={signOut} className="gold-btn">Logout</button>
          </>
        ) : (
          <>
            <Link href="/get-access" className="gold-link">Get Access</Link>
            <Link href="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
