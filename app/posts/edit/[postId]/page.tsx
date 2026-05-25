"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../../lib/supabase";
import AuthNavbar from "../../../components/auth-navbar";
import { isProfessionalRole } from "../../../../lib/roles";

type ProfileData = { role: string | null };

type PostData = {
  id: string;
  title: string | null;
  body: string | null;
  post_type: string | null;
  media_url: string | null;
  link_url: string | null;
  image_url: string | null;
  author_id: string;
};

export default function EditPostPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [post, setPost] = useState<PostData | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("article");
  const [mediaUrl, setMediaUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data } = await getSupabaseClient().auth.getSession();
      const session = data.session;
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const user = session.user;
      const { data: profileData } = await (getSupabaseClient().from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profileData || null);

      if (!postId) return;
      const { data: postData } = await (getSupabaseClient().from("posts") as any)
        .select("id,title,body,post_type,media_url,link_url,image_url,author_id")
        .eq("id", postId)
        .maybeSingle();

      if (!postData) {
        setStatus("Post not found.");
        return;
      }
      if (postData.author_id !== user.id) {
        setStatus("You are not authorized to edit this post.");
        return;
      }

      setIsAuthor(true);
      setPost(postData);
      setTitle(postData.title || "");
      setBody(postData.body || "");
      setPostType(postData.post_type || "article");
      setMediaUrl(postData.media_url || postData.image_url || "");
      setLinkUrl(postData.link_url || "");
    };

    load();
  }, [postId]);

  const canEdit = isProfessionalRole(profile?.role) && isAuthor;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canEdit || !postId) {
      setStatus("Unable to save this post.");
      return;
    }
    if (!title.trim()) {
      setStatus("Title is required.");
      return;
    }

    const { data } = await getSupabaseClient().auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      window.location.href = "/login";
      return;
    }

    const payload = {
      id: postId,
      title: title.trim(),
      body: body.trim() || null,
      post_type: postType,
      media_url: mediaUrl.trim() || null,
      link_url: linkUrl.trim() || null,
      image_url: postType === "image" ? mediaUrl.trim() || null : null,
    };

    const response = await fetch("/api/posts/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus(result?.error || "Unable to update post.");
      return;
    }

    router.push("/dashboard");
  };

  if (!postId) {
    return <main className="premium-page"><AuthNavbar /><section className="premium-card"><p className="muted">Missing post ID.</p></section></main>;
  }

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card onboarding-card">
        <h1>Edit post</h1>
        <p className="muted">Update your professional post and keep your latest content accurate.</p>

        {!canEdit ? (
          <article className="submission-item">
            <h2>Cannot edit</h2>
            <p className="muted">You must be the post author and a verified professional to make changes.</p>
          </article>
        ) : (
          <form className="premium-form" onSubmit={handleSubmit}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
            <select value={postType} onChange={(e) => setPostType(e.target.value)}>
              <option value="article">Article / update</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="image">Image</option>
            </select>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe this post update." />
            {postType !== "article" ? (
              <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder={postType === "video" ? "Video URL" : postType === "link" ? "External link URL" : "Image URL"} />
            ) : null}
            <button className="gold-btn" type="submit">Save changes</button>
          </form>
        )}
        {status ? <p className="muted">{status}</p> : null}
      </section>
    </main>
  );
}
