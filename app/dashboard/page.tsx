"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

export default function DashboardPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    getSupabaseClient().auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const user = data.session.user;
      setEmail(user.email ?? "");

      await (getSupabaseClient().from("profiles") as any).upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      document.cookie = "cc-auth=1; Path=/; Max-Age=604800; SameSite=Lax";
    });
  }, []);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <h1>Dashboard</h1>
        <p>Welcome back {email || "member"}.</p>
        <p>Browse opportunities and manage your profile.</p>
        <Link className="gold-link" href="/profile">Edit Profile</Link>
      </section>
    </main>
  );
}
