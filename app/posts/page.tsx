"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import PostCard from "../components/post-card";
import { LoadingState, EmptyState, ErrorState } from "../components/state-components";

type PostWithAuthor = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  media_url: string | null;
  image_url: string | null;
  link_url: string | null;
  created_at: string | null;
  author_id: string;
  author_name: string;
};

export default function PostsFeedPage() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const supabase = getSupabaseClient();
        const { data: postsData, error: postsError } = await (supabase.from("posts") as any)
          .select(
            "id,title,body,post_type,media_url,image_url,created_at,author_id,is_published"
          )
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(50);

        if (postsError) {
          throw postsError;
        }

        const postsArray = (postsData ?? []) as any[];
        const authorIds = Array.from(new Set(postsArray.map((item) => item.author_id).filter(Boolean)));

        let authorsMap = new Map<string, { full_name?: string | null; username?: string | null }>();
        if (authorIds.length > 0) {
          const { data: authorsData, error: authorsError } = await (supabase.from("profiles") as any)
            .select("id,full_name,username")
            .in("id", authorIds);

          if (authorsError) {
            throw authorsError;
          }

          (authorsData ?? []).forEach((author: any) => {
            if (author?.id) {
              authorsMap.set(author.id, author);
            }
          });
        }

        if (!active) return;

        setPosts(
          postsArray.map((post) => {
            const author = authorsMap.get(post.author_id);
            return {
              id: post.id,
              title: post.title,
              body: post.body,
              post_type: post.post_type,
              media_url: post.media_url,
              image_url: post.image_url,
              link_url: post.link_url,
              created_at: post.created_at,
              author_id: post.author_id,
              author_name: author?.full_name || author?.username || "Community",
            };
          })
        );
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Unable to load posts.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p className="homepage-kicker">Community Posts</p>
          <h1 className="homepage-section-title">Latest updates from creators</h1>
          <p className="homepage-section-text">
            Browse published posts, announcements, and media shared by verified professionals.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading posts..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            message="There are no published posts right now. Check back soon."
            action={{ label: "Reload", href: "/posts" }}
          />
        ) : (
          <div className="page-grid" style={{ gap: "1rem" }}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                body={post.body}
                post_type={post.post_type}
                author_name={post.author_name}
                author_id={post.author_id}
                created_at={post.created_at}
                media_url={post.media_url}
                image_url={post.image_url}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
