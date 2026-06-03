import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ProfileHeader } from "../../components/profile-header";
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

  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: "900px", margin: "1rem auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/directory" className="gold-link">← Back to Directory</Link>
        </div>

        <ProfileHeader profile={profileRow} />

        <section>
          {/* Additional public-facing info */}
          <div style={{ marginTop: "1rem" }}>
            {profileRow.description && (
              <div style={{ marginBottom: "1rem", lineHeight: 1.8 }}>{profileRow.description}</div>
            )}

            <div style={{ display: "grid", gap: "0.5rem" }}>
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
          </div>
        </section>

        <section style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Posts</h2>
          </div>

          {posts.length === 0 ? (
            <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "16px" }}>
              <p className="muted" style={{ margin: 0 }}>No posts yet.</p>
            </div>
          ) : (
            <div className="page-grid">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body}
                  post_type={post.post_type}
                  author_name={profileRow.full_name || profileRow.username}
                  author_id={post.author_id}
                  created_at={post.created_at}
                  media_url={post.media_url}
                  image_url={post.image_url}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
