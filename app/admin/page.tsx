"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { useAdminGuard } from "../components/admin-guard";

export default function AdminDashboardPage() {
  const { loading, error, isAdmin } = useAdminGuard("/admin");
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApps: 0,
    featuredProfs: 0,
    totalPosts: 0,
    totalOpportunities: 0,
    totalDirectory: 0,
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setDataError(null);
      try {
        const supabase = getSupabaseClient();

        // Stats: total users
        const { count: userCount } = await (supabase.from("profiles") as any).select("id", { count: "exact", head: true });

        // Stats: pending applications
        const { count: pendingCount } = await (supabase.from("applications") as any)
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");

        // Stats: featured professionals
        const { count: featuredCount } = await (supabase.from("profiles") as any)
          .select("id", { count: "exact", head: true })
          .eq("is_featured", true);

        // Stats: total posts
        const { count: postCount } = await (supabase.from("posts") as any).select("id", { count: "exact", head: true });

        // Stats: total opportunities
        const { count: oppCount } = await (supabase.from("opportunities") as any).select("id", { count: "exact", head: true });

        // Stats: total directory entries
        const { count: dirCount } = await (supabase.from("directory") as any).select("id", { count: "exact", head: true });

        // Recent applications
        const { data: apps } = await (supabase.from("applications") as any)
          .select("id,full_name,email,application_type,status,created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        // Recent profiles
        const { data: profiles } = await (supabase.from("profiles") as any)
          .select("id,full_name,username,role,is_featured,created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        // Recent posts
        const { data: posts } = await (supabase.from("posts") as any)
          .select("id,title,author_id,post_type,created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          totalUsers: userCount || 0,
          pendingApps: pendingCount || 0,
          featuredProfs: featuredCount || 0,
          totalPosts: postCount || 0,
          totalOpportunities: oppCount || 0,
          totalDirectory: dirCount || 0,
        });
        setRecentApps(apps || []);
        setRecentProfiles(profiles || []);
        setRecentPosts(posts || []);
      } catch (err: any) {
        console.error("[Admin] data load error:", err);
        setDataError(err?.message ?? "Failed to load admin data.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin]);

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
        <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <p className="muted">Checking admin access...</p>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
        <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <p style={{ color: "#ff6b6b" }}>You do not have admin access.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1400, margin: "2rem auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Admin Control Panel</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>Manage content, users, and platform operations</p>

        {error && <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</p>}
        {dataError && <p style={{ color: "#ff9800", marginBottom: "1rem" }}>⚠️ {dataError}</p>}

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          <StatCard label="Total Users" value={stats.totalUsers} href="/admin/users" action="Manage Users" />
          <StatCard label="Pending Applications" value={stats.pendingApps} href="/admin/applications" action="Review" accent={stats.pendingApps > 0} />
          <StatCard label="Featured Professionals" value={stats.featuredProfs} href="/admin/professionals" action="Manage" />
          <StatCard label="Opportunities" value={stats.totalOpportunities} href="/admin/opportunities" action="Manage" />
          <StatCard label="Posts & Media" value={stats.totalPosts} href="/admin/posts" action="Manage" />
          <StatCard label="Directory Listings" value={stats.totalDirectory} href="/admin/directory" action="Browse" />
        </div>

        {/* Admin Sections Grid */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#f4e8c1" }}>Management Sections</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <AdminSectionCard
              title="📋 Pending Applications"
              description="Review and approve/reject new member applications."
              href="/admin/applications"
              count={stats.pendingApps}
            />
            <AdminSectionCard
              title="⭐ Featured Professionals"
              description="Curate and feature professional profiles on the directory."
              href="/admin/professionals"
              count={stats.featuredProfs}
            />
            <AdminSectionCard
              title="📖 Directory Listings"
              description="Manage all professional directory entries and profiles."
              href="/admin/directory"
              count={stats.totalDirectory}
            />
            <AdminSectionCard
              title="💼 Opportunities"
              description="Create, edit, and manage opportunities for members."
              href="/admin/opportunities"
              count={stats.totalOpportunities}
            />
            <AdminSectionCard
              title="📱 Posts & Media"
              description="Review, feature, edit, or delete user-created content."
              href="/admin/posts"
              count={stats.totalPosts}
            />
            <AdminSectionCard
              title="👥 Users & Roles"
              description="Manage user profiles, roles, and account settings."
              href="/admin/users"
              count={stats.totalUsers}
            />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          <RecentActivityCard
            title="Recent Applications"
            items={recentApps}
            href="/admin/applications"
            renderItem={(app) => (
              <div key={app.id} style={{ borderBottom: "1px solid #4c3a18", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                <strong>{app.full_name || "Unknown"}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>{app.email}</div>
                <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {app.application_type} • <span style={{ color: app.status === "pending" ? "#ff9800" : "#3DBE8A" }}>{app.status}</span>
                </div>
              </div>
            )}
          />

          <RecentActivityCard
            title="Recent Posts"
            items={recentPosts}
            href="/admin/posts"
            renderItem={(post) => (
              <div key={post.id} style={{ borderBottom: "1px solid #4c3a18", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                <strong>{post.title || "Untitled"}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>{post.post_type}</div>
                <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Unknown date"}
                </div>
              </div>
            )}
          />

          <RecentActivityCard
            title="Recent User Profiles"
            items={recentProfiles}
            href="/admin/users"
            renderItem={(prof) => (
              <div key={prof.id} style={{ borderBottom: "1px solid #4c3a18", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                <strong>{prof.full_name || prof.username || "Unknown"}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>{prof.role || "user"}</div>
                {prof.is_featured && <div style={{ color: "#ffd700", fontSize: "0.8rem", marginTop: "0.5rem" }}>⭐ Featured</div>}
              </div>
            )}
          />
        </div>

        {/* Helper Info */}
        <div style={{ marginTop: "3rem", padding: "1.5rem", backgroundColor: "rgba(201, 168, 76, 0.08)", borderRadius: "10px", borderLeft: "4px solid #C9A84C" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>ℹ️ Admin Panel Help</h3>
          <ul style={{ fontSize: "0.9rem", color: "#d3c18e", lineHeight: "1.8" }}>
            <li>Click any section above to view full details and perform actions</li>
            <li>Some features may show placeholder buttons while backend integration is in progress</li>
            <li>All data is synced with Supabase in real-time</li>
            <li>Empty state cards indicate no data in that category yet</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  href,
  action,
  accent = false,
}: {
  label: string;
  value: number;
  href: string;
  action: string;
  accent?: boolean;
}) {
  return (
    <div className="stat-card" style={{ backgroundColor: accent ? "rgba(255, 152, 0, 0.1)" : "rgba(201, 168, 76, 0.08)" }}>
      <div className="stat-label" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{label}</div>
      <div className="stat-number" style={{ fontSize: "2.5rem", marginBottom: "0.75rem", color: accent ? "#ff9800" : "#f4cf70" }}>
        {value}
      </div>
      <Link href={href} className="gold-link" style={{ fontSize: "0.85rem", display: "inline-block" }}>
        {action} →
      </Link>
    </div>
  );
}

function AdminSectionCard({
  title,
  description,
  href,
  count,
}: {
  title: string;
  description: string;
  href: string;
  count?: number;
}) {
  return (
    <Link href={href}>
      <div className="admin-section-card" style={{ cursor: "pointer", transition: "all 0.2s", height: "100%" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>{title}</h3>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>{description}</p>
        <p className="muted" style={{ fontStyle: "italic", color: "#e9d9b0" }}>Coming next: manage / add / edit</p>
        {count !== undefined && <div className="muted" style={{ fontSize: "0.8rem" }}>Items: {count}</div>}
      </div>
    </Link>
  );
}

function RecentActivityCard({
  title,
  items,
  href,
  renderItem,
}: {
  title: string;
  items: any[];
  href: string;
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
          <p style={{ marginBottom: "1rem" }}>No items yet</p>
          <Link href={href} className="gold-btn" style={{ fontSize: "0.85rem" }}>
            Browse All
          </Link>
        </div>
      ) : (
        <div style={{ fontSize: "0.9rem" }}>
          {items.map(renderItem)}
          <Link href={href} className="gold-link" style={{ fontSize: "0.85rem", marginTop: "0.5rem", display: "block" }}>
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}
