"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { isAdminRole } from "../../lib/roles";
import { useState } from "react";

export default function RootNavBar() {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthed = Boolean(user);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <nav className="premium-nav">
        <div className="nav-top">
          <Link href="/" className="premium-brand">
            Community Collective
          </Link>

          <button
            className="mobile-menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((s) => !s)}
          >
            ☰
          </button>
        </div>

        {/* Desktop links (hidden on small screens via CSS) */}
        <div className="premium-links">
          <Link href="/">Home</Link>
          <Link href="/voices">Voices</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/directory">Directory</Link>

          {isAuthed ? (
            <>
              <Link href="/create" className="create-circle" aria-label="Create">
                <span aria-hidden>＋</span>
              </Link>
              {isAdminRole(role) && <Link href="/admin">Admin</Link>}
              <Link href="/dashboard">Dashboard</Link>
              <Link href={user ? `/u/${user.user_metadata?.username || user.email?.split('@')[0]}` : '/profile'}>Profile</Link>
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
              <Link href="/get-access" className="gold-link">
                Tap In
              </Link>
              <Link href="/login">Login</Link>
            </>
          ) : (
            <>
              <Link href="/get-access" className="gold-link">
                Tap In
              </Link>
              <Link href="/login">Login</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu (in-flow so it pushes content, not overlay) */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link href="/">Home</Link>
        <Link href="/voices">Voices</Link>
        <Link href="/opportunities">Opportunities</Link>
        <Link href="/directory">Directory</Link>
        <Link href="/recommend">Spotlight</Link>
        {isAuthed ? (
          <>
            <Link href="/create" className="gold-link">
              <span className="create-inline">＋</span>
            </Link>
            {isAdminRole(role) && <Link href="/admin">Admin</Link>}
            <Link href="/dashboard">Dashboard</Link>
            <Link href={user ? `/u/${user.user_metadata?.username || user.email?.split('@')[0]}` : '/profile'}>Profile</Link>
            <button onClick={handleLogout} className="gold-btn" style={{ cursor: "pointer" }} aria-label="Logout">Logout</button>
          </>
        ) : !loading ? (
          <>
            <Link href="/get-access" className="gold-link">Tap In</Link>
            <Link href="/login">Login</Link>
          </>
        ) : (
          <>
            <Link href="/get-access" className="gold-link">Tap In</Link>
            <Link href="/login">Login</Link>
          </>
        )}
      </div>

      {/* Mobile bottom nav (hidden on /login and /signup) */}
      {!(pathname?.startsWith("/login") || pathname?.startsWith("/signup")) && (
        <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
          <Link href="/">
            <span className="mb-icon">🏠</span>
            <span className="mb-label">Home</span>
          </Link>
          <Link href="/voices">
            <span className="mb-icon">🗣️</span>
            <span className="mb-label">Voices</span>
          </Link>
          {isAuthed && (
            <Link href="/create">
              <span className="mb-icon">➕</span>
              <span className="mb-label">Create</span>
            </Link>
          )}
          <Link href="/directory">
            <span className="mb-icon">📇</span>
            <span className="mb-label">Directory</span>
          </Link>
          <Link href="/recommend">
            <span className="mb-icon">✨</span>
            <span className="mb-label">Spotlight</span>
          </Link>
          <Link href={user ? `/u/${user.user_metadata?.username || user.email?.split('@')[0]}` : '/login'}>
            <span className="mb-icon">👤</span>
            <span className="mb-label">Profile</span>
          </Link>
        </nav>
      )}
    </>
  );
}
