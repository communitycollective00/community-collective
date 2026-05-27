"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../../lib/supabase";
import { isProfessionalRole } from "../../../lib/roles";

type ProfileData = { role: string | null };

export default function CreatePostPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("article");
  const [mediaUrl, setMediaUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [status, setStatus] = useState("");
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
    };

    load();
  }, []);

  const canPublish = isProfessionalRole(profile?.role) || profile?.role === "admin";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canPublish) {
      setStatus("Only verified professionals can publish public posts.");
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
      setStatus(result?.error || "Unable to create post.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="premium-page">
      <section className="premium-card onboarding-card">
        <h1>Create a professional post</h1>
        <p className="muted">Publish a trusted update, link, video, or image as a verified professional.</p>

        {!canPublish ? (
          <article className="submission-item">
            <h2>Access restricted</h2>
            <p className="muted">Only verified professionals and admins can create public posts. If you are a professional applicant, submit an application first.</p>
            <div className="quick-links">
              <a className="gold-link" href="/apply">Apply to be featured</a>
              <a className="gold-link" href="/directory">Browse professionals</a>
            </div>
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
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe the value of this post, resource, or opportunity." />
            {postType !== "article" ? (
              <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder={postType === "video" ? "Video URL" : postType === "link" ? "External link URL" : "Image URL"} />
            ) : null}
            <button className="gold-btn" type="submit">Publish post</button>
          </form>
        )}
        {status ? <p className="muted">{status}</p> : null}
      </section>
    </main>
  );
}
