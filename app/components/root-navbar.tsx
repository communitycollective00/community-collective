"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { isAdminRole } from "../../lib/roles";
import { useState } from "react";

function CCMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 680 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ccmark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#F5D97A" }} />
          <stop offset="100%" style={{ stopColor: "#C9A84C" }} />
        </linearGradient>
      </defs>
      <rect width="680" height="280" fill="url(#ccmark)" />
      <text x="-10" y="240" fontFamily="Georgia,serif" fontSize="290" fontWeight="700" fill="#0d0c08" opacity="0.06" letterSpacing="-10">CC</text>
      {/* 3D C1 depth */}
      <rect x="30" y="32" width="66" height="13" rx="1" fill="#7A5C1E" />
      <rect x="26" y="28" width="66" height="13" rx="1" fill="#8B6914" />
      <rect x="30" y="32" width="13" height="138" rx="1" fill="#6A4E10" />
      <rect x="26" y="28" width="13" height="138" rx="1" fill="#7A5C1E" />
      <rect x="30" y="156" width="66" height="13" rx="1" fill="#7A5C1E" />
      <rect x="26" y="152" width="66" height="13" rx="1" fill="#8B6914" />
      {/* 3D C1 front */}
      <rect x="18" y="20" width="66" height="13" rx="1" fill="#0d0c08" />
      <rect x="18" y="20" width="13" height="148" rx="1" fill="#0d0c08" />
      <rect x="18" y="154" width="66" height="13" rx="1" fill="#0d0c08" />
      <polygon points="18,20 26,28 92,28 84,20" fill="#2a1f08" />
      <polygon points="84,20 92,28 92,41 84,33" fill="#3a2a0a" />
      <polygon points="84,154 92,152 92,167 84,167" fill="#3a2a0a" />
      <polygon points="18,20 26,28 26,165 18,165" fill="#2a1f08" />
      {/* 3D C2 depth */}
      <rect x="62" y="52" width="56" height="11" rx="1" fill="#7A5C1E" />
      <rect x="58" y="48" width="56" height="11" rx="1" fill="#8B6914" />
      <rect x="62" y="52" width="11" height="104" rx="1" fill="#6A4E10" />
      <rect x="58" y="48" width="11" height="104" rx="1" fill="#7A5C1E" />
      <rect x="62" y="144" width="56" height="11" rx="1" fill="#7A5C1E" />
      <rect x="58" y="140" width="56" height="11" rx="1" fill="#8B6914" />
      {/* 3D C2 front */}
      <rect x="50" y="40" width="56" height="11" rx="1" fill="#1a1408" opacity="0.82" />
      <rect x="50" y="40" width="11" height="114" rx="1" fill="#1a1408" opacity="0.82" />
      <rect x="50" y="140" width="56" height="11" rx="1" fill="#1a1408" opacity="0.82" />
      <polygon points="50,40 58,48 114,48 106,40" fill="#2a1f08" opacity="0.7" />
      <polygon points="106,40 114,48 114,59 106,51" fill="#3a2a0a" opacity="0.7" />
    </svg>
  );
}

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
          <Link href="/" className="premium-brand" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <CCMark size={36} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 700, color: "#ffffff", letterSpacing: "1.5px" }}>CULTURE</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "11px", fontWeight: 700, color: "#C9A84C", letterSpacing: "1.5px" }}>COLLECTIVE</span>
            </div>
          </Link>

          <button
            className="mobile-menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((s) => !s)}
          >
            ☰
          </button>
        </div>

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
      </nav>

      {/* Mobile menu */}
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

      {/* Mobile bottom nav */}
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