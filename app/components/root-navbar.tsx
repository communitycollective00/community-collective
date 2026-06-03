"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { isAdminRole } from "../../lib/roles";

export default function RootNavBar() {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const isAuthed = Boolean(user);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="premium-nav">
      <Link href="/" className="premium-brand">
        Community Collective
      </Link>
      <div className="premium-links">
        <Link href="/">Home</Link>
        <Link href="/voices">Voices</Link>
        <Link href="/opportunities">Opportunities</Link>
        <Link href="/directory">Directory</Link>

        {isAuthed ? (
          <>
            {isAdminRole(role) && <Link href="/admin">Admin</Link>}
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <button
              onClick={handleLogout}
              className="gold-btn"
              style={{ cursor: "pointer" }}
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : !loading ? (
          <>
            <Link href="/signup" className="gold-link">
              Get Involved
            </Link>
            <Link href="/login">Login</Link>
          </>
        ) : (
          <>
            <Link href="/signup" className="gold-link">
              Get Involved
            </Link>
            <Link href="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
