"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../lib/supabase";
import MediaFeed from "./components/media-feed";

interface Post {
  id: string;
  title: string;
  body: string;
  post_type: string;
  media_url: string | null;
  image_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  location: string | null;
  tags: string[] | null;
  author_id: string;
  author_name: string;
  author_username: string | null;
  author_avatar: string | null;
  created_at: string;
  interview_guest_name: string | null;
  interview_guest_title: string | null;
  interview_guest_organization: string | null;
  interview_cover_url: string | null;
  interview_summary: string | null;
  interview_key_takeaways: string[] | null;
  media_type: string | null;
  status: string | null;
  visibility: string | null;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data, error: dbError } = await (supabase.from("posts") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (dbError) {
        throw dbError;
      }

      const postsData = (data || []).filter((post: any) => {
        const published = post.is_published === true || post.status === "published";
        const visible = post.visibility === undefined || post.visibility === "public";
        return published && visible;
      });

      const authorIds = Array.from(
        new Set(postsData.map((p: any) => p.author_id || p.user_id).filter(Boolean))
      );

      const { data: profiles } = await (supabase.from("profiles") as any)
        .select("id,full_name,username,avatar_url")
        .in("id", authorIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [
          p.id,
          {
            name: p.full_name || "Creator",
            username: p.username,
            avatar: p.avatar_url,
          },
        ])
      );

      const enrichedPosts = postsData.map((post: any) => {
        const authorId = post.author_id || post.user_id || "";
        const profile = profileMap.get(authorId) || {
          name: "Creator",
          username: null,
          avatar: null,
        };
        return {
          ...post,
          author_id: authorId,
          author_name: (profile as any).name || "Creator",
          author_username: (profile as any).username,
          author_avatar: (profile as any).avatar,
        };
      });

      setPosts(enrichedPosts);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (postId: string, saved: boolean) => {
    try {
      const supabase = getSupabaseClient();
      const user = await supabase.auth.getUser();

      if (!user.data.user) return;

      if (saved) {
        await (supabase.from("post_saves") as any).insert({
          user_id: user.data.user.id,
          post_id: postId,
        });
      } else {
        await (supabase.from("post_saves") as any)
          .delete()
          .eq("user_id", user.data.user.id)
          .eq("post_id", postId);
      }
    } catch (err) {
      console.error("Failed to save post:", err);
    }
  };

  const handleShare = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const text = `Check out "${post.title || "this post"}" on Community Collective`;
    const url = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      navigator.share({
        title: "Community Collective",
        text,
        url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <main className="premium-page homepage-main" style={{ paddingTop: "92px" }}>
      <div className="homepage-hero-section">
        <section className="homepage-hero">
          <div className="homepage-hero-bg" />
          <div className="homepage-hero-grid" />
          <div className="homepage-hero-glow" />
          <div className="homepage-hero-glow2" />

          <div className="homepage-hero-copy">
            <div className="homepage-hero-ribbon">
              <span className="homepage-hero-ribbon-pulse" />
              <p>Now in Media</p>
            </div>
            <h1 className="homepage-hero-title">
              <span className="homepage-highlight">Real</span> stories.
              <br />
              <span className="homepage-highlight--green">Real</span> people.
              <br />
              <span className="homepage-highlight">Real</span> change.
            </h1>
            <p className="homepage-hero-text">
              A media platform for documenting stories, sharing knowledge, creating access, and
              highlighting opportunities.
            </p>
            <div className="homepage-hero-actions">
              <Link href="/create/post" className="gold-btn">
                Share Your Story
              </Link>
              <Link href="/directory" className="gold-link">
                Explore Community
              </Link>
            </div>
          </div>
        </section>

        <div className="ticker-wrap homepage-ticker">
          <div className="ticker-track">
            <span className="ticker-item">Interviews</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Stories</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Opportunities</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Events</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Knowledge</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Community</span>
            <span className="tdot">◆</span>
          </div>
        </div>
      </div>

      <section className="media-feed-section">
        <div className="media-feed-section-header">
          <h2>Recent Stories</h2>
          <Link href="/posts" className="gold-link">
            View All →
          </Link>
        </div>

        {error && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--red)" }}>
            <p>Failed to load posts. Please try again later.</p>
          </div>
        )}

        <MediaFeed
          posts={posts.map((p) => ({
            id: p.id,
            type: (p.post_type || "story") as
              | "interview"
              | "event"
              | "story"
              | "insight"
              | "opportunity",
            creatorId: p.author_id,
            creatorName: p.author_name,
            creatorUsername: p.author_username,
            creatorAvatar: p.author_avatar,
            title: p.title,
            caption: p.caption || p.body || "",
            mediaUrl: p.image_url || p.media_url || p.thumbnail_url,
            mediaType: p.media_type === "video" || p.post_type === "video" ? "video" : "image",
            publishedAt: p.created_at,
            location: p.location,
            tags: p.tags,
            guestName: p.interview_guest_name,
            guestTitle: p.interview_guest_title,
            guestOrganization: p.interview_guest_organization,
            coverImage: p.interview_cover_url || p.image_url || p.media_url,
            interviewSummary: p.interview_summary,
            keyTakeaways: p.interview_key_takeaways,
          }))}
          loading={loading}
          onSave={handleSave}
          onShare={handleShare}
        />
      </section>
    </main>
  );
}
