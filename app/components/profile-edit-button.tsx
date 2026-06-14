"use client";
import Link from "next/link";
import { useAuth } from "./auth-provider";

export default function ProfileEditButton({ username }: { username: string }) {
  const { user } = useAuth();
  if (!user) return null;
  const myUsername = (user.user_metadata?.username || user.email?.split("@")[0] || "").toLowerCase();
  if (myUsername !== username.toLowerCase()) return null;
  return (
    <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.9rem", borderRadius: 999, border: "1px solid var(--gold2)", color: "var(--gold)", fontSize: "0.8rem", fontWeight: 600, marginTop: "0.5rem", background: "rgba(244,207,112,0.08)", textDecoration: "none" }}>
      ✏️ Edit Profile
    </Link>
  );
}
