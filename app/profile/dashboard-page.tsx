"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";
import { useAuth } from "../components/auth-provider";
import MediaFeed from "../components/media-feed";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  website: string | null;
}

interface UserPost {
  id: string;
  title: string;
  body: string;
  post_type: string;
  media_url: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  caption: string | null;
  location: string | null;
  tags: string[] | null;
  interview_guest_name: string | null;
  interview_guest_title: string | null;
  interview_guest_organization: string | null;
  interview_cover_url: string | null;
  interview_summary: string | null;
  interview_key_takeaways: string[] | null;
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "interviews" | "stories" | "opportunities">("all");

  useEffect(() => {
    if (!user) return;
    loadProfileData();
  }, [user]);

  async function loadProfileData() {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load profile
      const { data: profileData } = await (supabase.from("profiles") as any)
        .select("id,full_name,username,bio,avatar_url,banner_url,location,website")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Load user's posts using author_id if available, otherwise fallback to user_id.
      let postsData: any[] | null = null;
      let postsError: any = null;

      const { data: authorPosts, error: authorError } = await (supabase.from("posts") as any)
        .select("id,title,body,post_type,media_url,image_url,video_url,caption,location,tags,interview_guest_name,interview_guest_title,interview_guest_organization,interview_cover_url,interview_summary,interview_key_takeaways,created_at")
        .eq("author_id", user.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!authorError) {
        postsData = authorPosts;
      } else if (authorError.message?.includes("Could not find the 'author_id' column of 'posts'")) {
        const { data: userPosts, error: userError } = await (supabase.from("posts") as any)
          .select("id,title,body,post_type,media_url,image_url,video_url,caption,location,tags,interview_guest_name,interview_guest_title,interview_guest_organization,interview_cover_url,interview_summary,interview_key_takeaways,created_at")
          .eq("user_id", user.id)
          .eq("is_published", true)
          .order("created_at", { ascending: false });
        postsData = userPosts;
        postsError = userError;
      } else {
        postsError = authorError;
      }

      if (postsError) {
        console.error("Failed to load profile posts:", postsError);
        setPosts([]);
      } else {
        setPosts(postsData || []);
      }
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "interviews") return p.post_type === "interview";
    if (activeTab === "stories") return p.post_type === "story";
    if (activeTab === "opportunities") return p.post_type === "opportunity";
    return true;
  });

  const interviewCount = posts.filter((p) => p.post_type === "interview").length;
  const storyCount = posts.filter((p) => p.post_type === "story").length;
  const opportunityCount = posts.filter((p) => p.post_type === "opportunity").length;

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <div className="user-profile-loading">Loading profile...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <div className="user-profile-error">Profile not found</div>
      </main>
    );
  }

  return (
    <main className="premium-page user-profile-page" style={{ paddingTop: "92px" }}>
      {/* Profile Header */}
      <section className="user-profile-header">
        {profile.banner_url && (
          <div className="user-profile-banner">
            <img src={profile.banner_url} alt="Banner" />
          </div>
        )}

        <div className="user-profile-hero">
          <div className="user-profile-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || "User"} />
            ) : (
              <div className="user-profile-avatar-placeholder">
                {(profile.full_name || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="user-profile-info">
            <h1 className="user-profile-name">{profile.full_name}</h1>
            {profile.username && <p className="user-profile-username">@{profile.username}</p>}
            {profile.bio && <p className="user-profile-bio">{profile.bio}</p>}

            <div className="user-profile-meta">
              {profile.location && <span className="user-profile-meta-item">📍 {profile.location}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="user-profile-meta-item">
                  🔗 {profile.website}
                </a>
              )}
            </div>

            <div className="user-profile-stats">
              <div className="stat">
                <span className="stat-number">{interviewCount}</span>
                <span className="stat-label">Interviews</span>
              </div>
              <div className="stat">
                <span className="stat-number">{storyCount}</span>
                <span className="stat-label">Stories</span>
              </div>
              <div className="stat">
                <span className="stat-number">{opportunityCount}</span>
                <span className="stat-label">Opportunities</span>
              </div>
            </div>

            <Link href="/profile/edit" className="gold-btn" style={{ marginTop: "1rem" }}>
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Contribution Tabs */}
      <section className="user-profile-contributions">
        <div className="contribution-tabs">
          <button
            className={`contribution-tab ${activeTab === "all" ? "contribution-tab--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Posts ({posts.length})
          </button>
          <button
            className={`contribution-tab ${activeTab === "interviews" ? "contribution-tab--active" : ""}`}
            onClick={() => setActiveTab("interviews")}
          >
            🎤 Interviews ({interviewCount})
          </button>
          <button
            className={`contribution-tab ${activeTab === "stories" ? "contribution-tab--active" : ""}`}
            onClick={() => setActiveTab("stories")}
          >
            📖 Stories ({storyCount})
          </button>
          <button
            className={`contribution-tab ${activeTab === "opportunities" ? "contribution-tab--active" : ""}`}
            onClick={() => setActiveTab("opportunities")}
          >
            🔗 Opportunities ({opportunityCount})
          </button>
        </div>

        {filteredPosts.length > 0 ? (
          <MediaFeed
            posts={filteredPosts.map((p) => ({
              id: p.id,
              type: (p.post_type || "story") as "interview" | "event" | "story" | "insight" | "opportunity",
              creatorId: user?.id || "",
              creatorName: profile.full_name || "Creator",
              creatorUsername: profile.username,
              creatorAvatar: profile.avatar_url,
              title: p.title,
              caption: p.caption || p.body || "",
              mediaUrl: p.image_url || p.media_url,
              mediaType: p.video_url ? "video" : "image",
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
          />
        ) : (
          <div className="user-profile-empty">
            <p className="user-profile-empty-icon">📹</p>
            <p>No {activeTab !== "all" ? activeTab : "posts"} yet</p>
            <Link href="/create/post" className="gold-btn" style={{ marginTop: "1rem" }}>
              Create Your First Post
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
