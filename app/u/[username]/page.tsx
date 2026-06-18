import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import PostCard from "../../components/post-card";
import ProfileEditButton from "../../components/profile-edit-button";

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
          <Link href="/directory" className="gold-link">← Back to Directory</Link>
        </section>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const uname = params.username?.trim().toLowerCase();

  const [profileRes, bgRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,username,role,bio,description,industry,location,city,state,avatar_url,banner_url,is_featured,is_approved,website,instagram,twitter,linkedin")
      .eq("username", uname)
      .maybeSingle(),
    supabase
      .from("page_backgrounds")
      .select("image_url")
      .eq("page_key", "profile")
      .limit(1),
  ]);

  if (!profileRes.data) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px" }}>
        <section className="premium-card">
          <h1>Profile not found</h1>
          <p className="muted">We couldn't find a profile with that username.</p>
          <Link href="/directory" className="gold-link">← Back to Directory</Link>
        </section>
      </main>
    );
  }

  const profileRow: ProfileRow = profileRes.data;
  const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
  const pageBg = bgRow?.image_url || null;

  let posts: PostRow[] = [];
  const { data: authorPosts, error: authorError } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", profileRow.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (!authorError) {
    posts = authorPosts ?? [];
  } else if (authorError.message?.includes("Could not find the 'author_id' column of 'posts'")) {
    const { data: userPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profileRow.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    posts = userPosts ?? [];
  }

  const displayName = profileRow.full_name || profileRow.username || "Community Member";
  const displayUsername = profileRow.username ? `@${profileRow.username}` : "";
  const locationLine = [profileRow.city, profileRow.state].filter(Boolean).join(", ") || profileRow.location || null;
  const hasSocials = profileRow.website || profileRow.instagram || profileRow.twitter || profileRow.linkedin;

  const bgStyle = pageBg
    ? { backgroundImage: `url(${pageBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundAttachment: "fixed" }
    : {};

  return (
    <main className="premium-page" style={{ paddingTop: "72px", ...bgStyle }}>

      {/* ── HERO BANNER ── */}
      <div style={{ position: "relative", width: "100%", height: 160, background: profileRow.banner_url ? "transparent" : "linear-gradient(135deg, #1a1408 0%, #0d0c08 100%)", overflow: "hidden" }}>
        {profileRow.banner_url && (
          <img
            src={profileRow.banner_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(13,12,8,0.85) 100%)" }} />
      </div>

      {/* ── MAIN LAYOUT: two-column on desktop ── */}
      <div className="profile-two-col" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem", gap: "2rem", alignItems: "start" }}>

        {/* ── LEFT COLUMN: identity card ── */}
        <aside style={{ position: "sticky", top: "100px" }}>

          {/* Avatar — overlaps banner */}
          <div className="profile-avatar-wrap" style={{ marginTop: -88, marginBottom: "1.25rem" }}>
            <img
              src={profileRow.avatar_url || `https://placehold.co/160x160/1a1408/f4cf70?text=${encodeURIComponent(displayName[0] || "C")}`}
              alt={displayName}
              style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "4px solid var(--gold)", display: "block", background: "#0d0c08", boxShadow: "0 8px 28px rgba(0,0,0,0.55), 0 0 0 2px rgba(201,168,76,0.25)" }}
            />
          </div>

          {/* Name + badges */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{displayName}</h1>
              <ProfileEditButton username={profileRow.username || ""} />
            </div>
            {displayUsername && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 0.25rem" }}>{displayUsername}</p>}
            {profileRow.role && <p style={{ color: "var(--gold)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.25rem" }}>{profileRow.role}</p>}
            {profileRow.industry && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 0.25rem" }}>{profileRow.industry}</p>}
            {locationLine && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>📍 {locationLine}</p>}
          </div>

          {/* Verification badges */}
          {(profileRow.is_featured || profileRow.is_approved) && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {profileRow.is_featured && <span className="profile-badge">⭐ Featured</span>}
              {profileRow.is_approved && <span className="profile-badge">✓ Verified</span>}
            </div>
          )}

          {/* Bio */}
          {profileRow.bio && (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{profileRow.bio}</p>
          )}

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { value: posts.length, label: "Posts" },
              { value: 0, label: "Opportunities" },
              { value: 0, label: "Interviews" },
              { value: 0, label: "Connections" },
            ].map(({ value, label }) => (
              <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.75rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.25rem" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Socials */}
          {hasSocials && (
            <div style={{ display: "grid", gap: "0.6rem" }}>
              {profileRow.website && (
                <a href={profileRow.website} target="_blank" rel="noopener noreferrer" className="gold-link" style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  🌐 {profileRow.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {profileRow.instagram && (
                <a href={`https://instagram.com/${profileRow.instagram}`} target="_blank" rel="noopener noreferrer" className="gold-link" style={{ fontSize: "0.85rem" }}>
                  📸 @{profileRow.instagram}
                </a>
              )}
              {profileRow.twitter && (
                <a href={`https://twitter.com/${profileRow.twitter}`} target="_blank" rel="noopener noreferrer" className="gold-link" style={{ fontSize: "0.85rem" }}>
                  𝕏 @{profileRow.twitter}
                </a>
              )}
              {profileRow.linkedin && (
                <a href={`https://linkedin.com/in/${profileRow.linkedin}`} target="_blank" rel="noopener noreferrer" className="gold-link" style={{ fontSize: "0.85rem" }}>
                  💼 {profileRow.linkedin}
                </a>
              )}
            </div>
          )}
        </aside>

        {/* ── RIGHT COLUMN: content ── */}
        <div style={{ paddingTop: "1.5rem" }}>

          {/* Description / extended bio */}
          {profileRow.description && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gold2)", marginBottom: "0.75rem" }}>ABOUT</p>
              <p style={{ color: "var(--text)", lineHeight: 1.8, fontSize: "0.95rem" }}>{profileRow.description}</p>
            </div>
          )}

          {/* Featured section */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Featured</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", gridColumn: "1 / -1" }}>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Highlights, media, and curated work will appear here.</p>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                Posts <span style={{ color: "var(--muted)", fontWeight: 400 }}>({posts.length})</span>
              </h2>
            </div>

            {posts.length === 0 ? (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "2rem", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No posts yet. Photos, videos, interviews, and opportunities will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
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
          </div>

          {/* Opportunities */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Opportunities</h2>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Relevant openings and collaboration opportunities will show here.</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
