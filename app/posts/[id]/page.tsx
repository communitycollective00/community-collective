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
  interview_guest_name?: string | null;
  interview_guest_title?: string | null;
  interview_guest_organization?: string | null;
  interview_cover_url?: string | null;
  interview_summary?: string | null;
  interview_key_takeaways?: string[] | null;
  caption?: string | null;
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
    .select("id,title,body,caption,post_type,media_url,image_url,created_at,author_id,interview_guest_name,interview_guest_title,interview_guest_organization,interview_cover_url,interview_summary,interview_key_takeaways")
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

          {/* Interview guest info */}
          {postData.post_type === "interview" && postData.interview_guest_name && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--gold2)", fontSize: "0.75rem", fontFamily: "var(--font-display)", letterSpacing: "0.1em", margin: "0 0 0.5rem" }}>INTERVIEW WITH</p>
              <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.5rem", color: "var(--text)" }}>{postData.interview_guest_name}</h2>
              {postData.interview_guest_title && <p style={{ margin: "0 0 0.1rem", color: "var(--muted)" }}>{postData.interview_guest_title}</p>}
              {postData.interview_guest_organization && <p style={{ margin: 0, color: "var(--secondary)", fontSize: "0.9rem" }}>{postData.interview_guest_organization}</p>}
            </div>
          )}

          {/* Cover image */}
          {(postData.interview_cover_url || postData.image_url) && (
            <img
              src={postData.interview_cover_url || postData.image_url || ""}
              alt={displayTitle}
              style={{ width: "100%", borderRadius: 16, objectFit: "cover", maxHeight: 480, marginBottom: "1.5rem", border: "1px solid var(--border)" }}
            />
          )}

          {/* Video player */}
          {postData.media_url && (postData.post_type === "video" || postData.post_type === "interview") && (
            <video controls preload="metadata" style={{ width: "100%", borderRadius: 16, marginBottom: "1.5rem", background: "#000", maxHeight: 520 }}>
              <source src={postData.media_url} />
              Your browser does not support video playback.
            </video>
          )}

          {/* Summary */}
          {(postData.interview_summary || postData.body || postData.caption) && (
            <div style={{ whiteSpace: "pre-line", lineHeight: 1.8, marginBottom: "1.5rem", color: "var(--text)" }}>
              {postData.interview_summary || postData.body || postData.caption}
            </div>
          )}

          {/* Key takeaways */}
          {postData.interview_key_takeaways && postData.interview_key_takeaways.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--gold2)", fontSize: "0.75rem", fontFamily: "var(--font-display)", letterSpacing: "0.1em", margin: "0 0 0.75rem" }}>KEY TAKEAWAYS</p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {postData.interview_key_takeaways.map((t: string, i: number) => (
                  <li key={i} style={{ color: "var(--muted)", lineHeight: 1.6 }}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* External link */}
          {postData.link_url && (
            <div>
              <p className="muted" style={{ marginBottom: "0.5rem" }}>External link</p>
              <a href={postData.link_url} target="_blank" rel="noopener noreferrer" className="gold-link">{postData.link_url}</a>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
