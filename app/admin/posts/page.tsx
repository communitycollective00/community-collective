"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminPostsPage() {
  const { loading, error, isAdmin, setError } = useAdminGuard("/admin/posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isAdmin) return;
      setError(null);
      try {
        const supabase = getSupabaseClient();
        const { data, error: fetchErr } = await supabase
          .from("posts")
          .select("id,title,author_id,user_id,post_type,is_published,created_at")
          .order("created_at", { ascending: false })
          .limit(100);

        if (fetchErr) throw fetchErr;
        setPosts(data || []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load posts.");
      }
    }

    if (!loading && isAdmin) load();
  }, [loading, isAdmin, setError]);

  async function deletePost(postId: string) {
    if (!confirm("Delete this post?")) return;
    setUpdating(true);
    try {
      const supabase = getSupabaseClient();
      const { error: deleteErr } = await (supabase.from("posts") as any).delete().eq("id", postId);

      if (deleteErr) throw deleteErr;

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete post.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card admin-card" style={{ maxWidth: 1200, margin: "2rem auto" }}>
          <Link href="/admin" style={{ color: "#d3c18e", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
            ← Back to Dashboard
          </Link>

          <h1>Posts & Media</h1>
          <p className="muted">Review and manage user-created content</p>

          {loading && <p className="muted">Loading posts...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {isAdmin && (
            <>
              {posts.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
                  <p className="muted">No posts found.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                  {posts.map((post: any) => (
                    <div key={post.id} className="card">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start" }}>
                        <div>
                          <h3 style={{ margin: "0 0 0.5rem 0" }}>{post.title || "Untitled"}</h3>
                          <div style={{ fontSize: "0.85rem" }}>
                            <div className="muted">
                              Type: {post.post_type || "unknown"} • Published: {post.is_published ? "Yes" : "No"}
                            </div>
                            <div className="muted">Author: {post.author_id || post.user_id || "Unknown"}</div>
                            <div className="muted">Created: {new Date(post.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => deletePost(post.id)}
                          disabled={updating}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "#f44336",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
      </section>
    </main>
  );
}
