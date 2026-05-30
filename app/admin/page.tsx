"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { useAdminGuard } from "../components/admin-guard";

type AdminStats = {
  profiles: number;
  pendingApps: number;
  featuredProfs: number;
  totalPosts: number;
};

const adminSections = [
  {
    title: "Applications",
    description: "Review member access requests and approval status.",
    href: "/admin/applications",
    highlight: true,
  },
  {
    title: "Submissions",
    description: "View all membership submissions and intake records.",
    href: "/admin/submissions",
  },
  {
    title: "Users",
    description: "Manage user accounts, roles, and admin permissions.",
    href: "/admin/users",
  },
  {
    title: "Directory Profiles",
    description: "Manage professional directory entries and profile visibility.",
    href: "/admin/directory",
  },
  {
    title: "Opportunities",
    description: "Create and manage member opportunities.",
    href: "/admin/opportunities",
  },
  {
    title: "Events",
    description: "Curate upcoming events and community gatherings.",
    href: "/admin/events",
  },
  {
    title: "Voices",
    description: "Shape stories, creator voices, and editorial content.",
    href: "/admin/voices",
  },
  {
    title: "Posts / Media",
    description: "Review published posts, media, and user content.",
    href: "/admin/posts",
  },
  {
    title: "Companies",
    description: "Manage company profiles and organization listings.",
    href: "/admin/companies",
  },
];

export default function AdminPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin");
  const [stats, setStats] = useState<AdminStats>({
    profiles: 0,
    pendingApps: 0,
    featuredProfs: 0,
    totalPosts: 0,
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);

      try {
        const supabase = getSupabaseClient();

        const [{ count: profileCount }, { count: pendingCount }, { count: featuredCount }, { count: postCount }] = await Promise.all([
          (supabase.from("profiles") as any).select("id", { count: "exact", head: true }),
          (supabase.from("applications") as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
          (supabase.from("profiles") as any).select("id", { count: "exact", head: true }).eq("is_featured", true),
          (supabase.from("posts") as any).select("id", { count: "exact", head: true }),
        ]);

        const [{ data: apps }, { data: profiles }, { data: posts }] = await Promise.all([
          (supabase.from("applications") as any)
            .select("id,full_name,email,application_type,status,created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          (supabase.from("profiles") as any)
            .select("id,full_name,username,role,is_featured,created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          (supabase.from("posts") as any)
            .select("id,title,post_type,created_at")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          profiles: profileCount || 0,
          pendingApps: pendingCount || 0,
          featuredProfs: featuredCount || 0,
          totalPosts: postCount || 0,
        });
        setRecentApps(apps || []);
        setRecentProfiles(profiles || []);
        setRecentPosts(posts || []);
      } catch (err: any) {
        console.error("[Admin] data load error:", err);
        setError(err?.message ?? "Failed to load admin data.");
      }
    }

    if (!loading && isAdmin) {
      load();
    }
  }, [loading, isAdmin, setError]);

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
        <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <p className="muted">Loading admin...</p>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
        <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <h1>Access denied</h1>
          <p className="muted">You do not have admin access to view this page.</p>
          {error ? <p style={{ color: "#ff6b6b", marginTop: "1rem" }}>{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1400, margin: "2rem auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Admin Content Manager</h1>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          A unified dashboard for the main content sections. Use the cards below to move into each area and build the next admin experiences.
        </p>

        {error && <p style={{ color: "#ff6b6b", marginBottom: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="gold-link"
              style={{
                padding: "0.75rem 1.1rem",
                borderRadius: "999px",
                border: section.highlight ? "1px solid #f4cf70" : "1px solid rgba(201, 168, 76, 0.4)",
                background: section.highlight ? "rgba(244, 207, 112, 0.12)" : "transparent",
                whiteSpace: "nowrap",
              }}
            >
              {section.title}
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          <StatCard label="Directory Profiles" value={stats.profiles} href="/admin/directory" action="Manage Profiles" />
          <StatCard label="Pending Applications" value={stats.pendingApps} href="/admin/applications" action="Review" accent={stats.pendingApps > 0} />
          <StatCard label="Featured Professionals" value={stats.featuredProfs} href="/admin/professionals" action="Curate" />
          <StatCard label="Posts / Media" value={stats.totalPosts} href="/admin/posts" action="Review" />
        </div>

        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#f4e8c1" }}>Admin Sections</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {adminSections.map((section) => (
              <AdminSectionCard
                key={section.href}
                title={section.title}
                description={section.description}
                href={section.href}
                count={
                  section.title === "Applications"
                    ? stats.pendingApps
                    : section.title === "Directory Profiles"
                      ? stats.profiles
                      : section.title === "Posts / Media"
                        ? stats.totalPosts
                        : section.title === "Featured Professionals"
                          ? stats.featuredProfs
                          : undefined
                }
              />
            ))}
          </div>
        </div>

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
            title="Recent Profiles"
            items={recentProfiles}
            href="/admin/directory"
            renderItem={(prof) => (
              <div key={prof.id} style={{ borderBottom: "1px solid #4c3a18", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                <strong>{prof.full_name || prof.username || "Unknown"}</strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>{prof.role || "user"}</div>
                {prof.is_featured && <div style={{ color: "#ffd700", fontSize: "0.8rem", marginTop: "0.5rem" }}>⭐ Featured</div>}
              </div>
            )}
          />
        </div>

        <div style={{ marginTop: "3rem", padding: "1.5rem", backgroundColor: "rgba(201, 168, 76, 0.08)", borderRadius: "10px", borderLeft: "4px solid #C9A84C" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>ℹ️ Admin Panel Help</h3>
          <ul style={{ fontSize: "0.9rem", color: "#d3c18e", lineHeight: "1.8" }}>
            <li>Click any section above to view full details and perform actions</li>
            <li>Some features may show placeholder content while backend integration is built out</li>
            <li>All data is pulled from Supabase for available tables</li>
            <li>Missing content sections are represented as shell pages in the admin area</li>
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
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="admin-section-card" style={{ cursor: "pointer", transition: "all 0.2s", height: "100%", padding: "1.25rem", borderRadius: "16px", backgroundColor: "rgba(34, 24, 13, 0.7)", border: "1px solid rgba(201, 168, 76, 0.15)" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>{title}</h3>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>{description}</p>
        {count !== undefined ? (
          <div className="muted" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>Current count: {count}</div>
        ) : (
          <div className="muted" style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>Count unavailable</div>
        )}
        <div className="muted" style={{ fontStyle: "italic", color: "#e9d9b0" }}>Coming next: manage / add / edit</div>
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
