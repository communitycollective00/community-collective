import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { ProfileHeader } from "../../components/profile-header";

type PostRow = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  media_url: string | null;
  image_url: string | null;
  link_url: string | null;
  created_at: string | null;
  author_id: string;
};

type AuthorProfile = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  role?: string | null;
  is_featured?: boolean | null;
  is_approved?: boolean | null;
  industry?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseClient();

  const { data: postData } = await (supabase.from("posts") as any)
    .select("id,title,body,post_type,media_url,image_url,link_url,created_at,author_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!postData) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <section className="premium-card" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1>Post not found</h1>
          <p className="muted">The post you're looking for could not be found.</p>
          <Link href="/posts" className="gold-link">
            ← Back to posts
          </Link>
        </section>
      </main>
    );
  }

  const { data: authorData } = await (supabase.from("profiles") as any)
    .select(
      "id,full_name,username,bio,avatar_url,banner_url,role,is_featured,is_approved,industry,location,city,state,website,instagram,twitter,linkedin"
    )
    .eq("id", postData.author_id)
    .maybeSingle();

  const authorProfile: AuthorProfile = authorData
    ? authorData
    : {
        id: postData.author_id,
        full_name: null,
        username: null,
      };

  const displayTitle = postData.title || "Untitled post";
  const displayType = postData.post_type || "Update";
  const createdAt = formatDate(postData.created_at);
  const authorName = authorProfile.full_name || authorProfile.username || "Community member";

  return (
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <section className="premium-card" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <p className="homepage-kicker">Post detail</p>
            <h1 className="homepage-section-title" style={{ marginBottom: "0.5rem" }}>{displayTitle}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {displayType} • {createdAt} • by {authorName}
            </p>
          </div>
          <Link href="/posts" className="gold-link">
            ← Back to posts
          </Link>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <ProfileHeader profile={authorProfile} />
        </div>

        <article style={{ marginBottom: "2rem" }}>
          {postData.body ? (
            <div style={{ whiteSpace: "pre-line", lineHeight: 1.8, marginBottom: "1.5rem" }}>{postData.body}</div>
          ) : (
            <p className="muted">No post body provided.</p>
          )}

          {postData.image_url && (
            <img
              src={postData.image_url}
              alt={displayTitle}
              style={{ width: "100%", borderRadius: "16px", objectFit: "cover", marginBottom: "1.5rem", border: "1px solid var(--border)" }}
            />
          )}

          {postData.media_url && postData.post_type !== "image" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <p className="muted" style={{ marginBottom: "0.5rem" }}>Media link</p>
              <a href={postData.media_url} target="_blank" rel="noopener noreferrer" className="gold-link">
                {postData.media_url}
              </a>
            </div>
          )}

          {postData.link_url && (
            <div>
              <p className="muted" style={{ marginBottom: "0.5rem" }}>External link</p>
              <a href={postData.link_url} target="_blank" rel="noopener noreferrer" className="gold-link">
                {postData.link_url}
              </a>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
