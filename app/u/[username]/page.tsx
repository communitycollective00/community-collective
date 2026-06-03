import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PostCard from "../../components/post-card";

type ProfileRow = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  role?: string | null;
  bio?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  is_featured?: boolean | null;
  is_approved?: boolean | null;
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
};

type PostRow = {
  id: string;
  author_id: string;
  title?: string | null;
  body?: string | null;
  post_type?: string | null;
  media_url?: string | null;
  link_url?: string | null;
  image_url?: string | null;
  is_published?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px" }}>
        <section className="premium-card">
          <h1>Profile not found</h1>
          <p className="muted">We couldn't find a profile with that username.</p>
          <Link href="/directory" className="gold-link">
            ← Back to Directory
          </Link>
        </section>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const uname = params.username?.trim().toLowerCase();

  const { data } = await supabase
    .from("profiles")
    .select(
      "id,full_name,username,role,bio,description,industry,location,city,state,avatar_url,banner_url,is_featured,is_approved,website,instagram,twitter,linkedin"
    )
    .eq("username", uname)
    .maybeSingle();

  if (!data) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px" }}>
        <section className="premium-card">
          <h1>Profile not found</h1>
          <p className="muted">We couldn't find a profile with that username.</p>
          <Link href="/directory" className="gold-link">
            ← Back to Directory
          </Link>
        </section>
      </main>
    );
  }

  const profileRow: ProfileRow = data;

  const { data: postsData } = await supabase
    .from("posts")
    .select("id,author_id,title,body,post_type,media_url,link_url,image_url,is_published,created_at,updated_at")
    .eq("author_id", profileRow.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const posts: PostRow[] = postsData ?? [];
  const displayName = profileRow.full_name || profileRow.username || "Community Member";
  const displayUsername = profileRow.username ? `@${profileRow.username}` : "";
  const displaySubtitle = [profileRow.industry, profileRow.location].filter(Boolean).join(" • ");

  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card public-profile-card" style={{ maxWidth: "1100px", margin: "1rem auto", padding: 0, overflow: "hidden" }}>
        <div className="public-profile-hero" style={{ backgroundImage: profileRow.banner_url ? `url(${profileRow.banner_url})` : undefined }}>
          <div className="public-profile-hero-overlay" />
        </div>

        <div className="public-profile-avatar-block">
          <div className="public-profile-avatar-wrap">
            <img
              src={
                profileRow.avatar_url ||
                `https://placehold.co/180x180/1a1408/f4cf70?text=${encodeURIComponent(displayName[0] || "C")}`
              }
              alt={displayName}
              className="profile-avatar public-profile-avatar"
            />
          </div>
        </div>

        <div className="public-profile-header-copy">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", textAlign: "center" }}>
              <h1>{displayName}</h1>
              {profileRow.is_featured && <span className="profile-badge">Featured</span>}
              {profileRow.is_approved && <span className="profile-badge">Verified</span>}
            </div>
            {displayUsername && <p className="muted" style={{ margin: "0.5rem 0 0" }}>{displayUsername}</p>}
            {displaySubtitle && <p className="muted" style={{ margin: "0.5rem 0 0" }}>{displaySubtitle}</p>}
            {profileRow.bio && <p style={{ margin: "1rem 0 0", lineHeight: 1.8 }}>{profileRow.bio}</p>}
        </div>

        <div className="public-profile-stats">
          <div className="public-profile-stat">
            <span className="public-profile-stat-value">{posts.length}</span>
            <span className="public-profile-stat-label">Posts</span>
          </div>
          <div className="public-profile-stat">
            <span className="public-profile-stat-value">0</span>
            <span className="public-profile-stat-label">Opportunities</span>
          </div>
          <div className="public-profile-stat">
            <span className="public-profile-stat-value">0</span>
            <span className="public-profile-stat-label">Interviews</span>
          </div>
          <div className="public-profile-stat">
            <span className="public-profile-stat-value">0</span>
            <span className="public-profile-stat-label">Connections</span>
          </div>
        </div>

        <section className="public-profile-links" style={{ padding: "0 1.5rem 1.5rem" }}>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {profileRow.website && (
              <a href={profileRow.website} target="_blank" rel="noopener noreferrer" className="gold-link">
                🌐 {profileRow.website}
              </a>
            )}
            {profileRow.instagram && (
              <a href={`https://instagram.com/${profileRow.instagram}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                📸 @{profileRow.instagram}
              </a>
            )}
            {profileRow.twitter && (
              <a href={`https://twitter.com/${profileRow.twitter}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                𝕏 @{profileRow.twitter}
              </a>
            )}
            {profileRow.linkedin && (
              <a href={`https://linkedin.com/in/${profileRow.linkedin}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                💼 {profileRow.linkedin}
              </a>
            )}
          </div>
        </section>

        <section className="public-profile-featured" style={{ padding: "0 1.5rem 1.5rem" }}>
          <div className="public-profile-section-header">
            <h2>Featured</h2>
          </div>
          <div className="public-profile-content-grid">
            <div className="public-profile-empty-card">
              <h3>No featured content yet</h3>
              <p>Highlights, media, and curated work will appear here.</p>
            </div>
            <div className="public-profile-empty-card public-profile-placeholder-card" />
            <div className="public-profile-empty-card public-profile-placeholder-card" />
          </div>
        </section>

        <section className="public-profile-posts" style={{ padding: "0 1.5rem 1.5rem" }}>
          <div className="public-profile-section-header">
            <h2>Posts</h2>
          </div>

          {posts.length === 0 ? (
            <div className="public-profile-empty-card public-profile-empty-card--large">
              <h3>No posts yet</h3>
              <p>Photos, videos, interviews, and opportunities will appear here.</p>
            </div>
          ) : (
            <div className="public-profile-posts-grid">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body}
                  post_type={post.post_type}
                  author_name={displayName}
                  author_id={post.author_id}
                  created_at={post.created_at}
                  media_url={post.media_url}
                  image_url={post.image_url}
                />
              ))}
            </div>
          )}
        </section>

        <section className="public-profile-opportunities" style={{ padding: "0 1.5rem 1.5rem" }}>
          <div className="public-profile-section-header">
            <h2>Opportunities</h2>
          </div>
          <div className="public-profile-content-grid">
            <div className="public-profile-empty-card">
              <h3>No opportunities yet</h3>
              <p>Relevant openings and collaboration opportunities will show here.</p>
            </div>
            <div className="public-profile-empty-card public-profile-placeholder-card" />
            <div className="public-profile-empty-card public-profile-placeholder-card" />
          </div>
        </section>
      </section>
    </main>
  );
}
