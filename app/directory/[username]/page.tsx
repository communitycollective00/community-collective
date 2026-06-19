"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "../../../lib/supabase";
import { ProfileHeader } from "../../components/profile-header";
import PostCard from "../../components/post-card";
import { LoadingState, EmptyState, ErrorState } from "../../components/state-components";

type PublicProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  bio: string | null;
  description: string | null;
  category: string | null;
  industry: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  phone: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  role: string | null;
  is_featured: boolean | null;
  is_approved: boolean | null;
};

type ProfilePost = {
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

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await (getSupabaseClient().from("profiles") as any)
        .select(
          "id,full_name,email,username,bio,description,category,industry,location,city,state,website,instagram,tiktok,youtube,twitter,linkedin,avatar_url,banner_url,role,is_featured,is_approved"
        )
        .eq("username", username)
        .maybeSingle();

      if (!data) {
        // Fallback: check curated directory_listings by slug
        const { data: listing } = await (getSupabaseClient().from("directory_listings") as any)
          .select("id,slug,name,category,city,state,bio,website,phone,image_url,is_featured,is_verified")
          .eq("slug", username)
          .maybeSingle();

        if (!listing) {
          setError("Profile not found");
          setProfile(null);
          return;
        }

        // Map listing into the PublicProfile shape
        setProfile({
          id: listing.id,
          full_name: listing.name,
          username: listing.slug,
          email: null,
          bio: listing.bio,
          description: null,
          category: listing.category,
          industry: listing.category,
          location: [listing.city, listing.state].filter(Boolean).join(", "),
          city: listing.city,
          state: listing.state,
          website: listing.website,
          phone: listing.phone,
          instagram: null,
          tiktok: null,
          youtube: null,
          twitter: null,
          linkedin: null,
          avatar_url: listing.image_url,
          banner_url: null,
          role: "business",
          is_featured: listing.is_featured,
          is_approved: listing.is_verified,
        });
        setPosts([]);
        return;
      }

      setProfile(data);

      try {
        const { data: postsData } = await (getSupabaseClient().from("posts") as any)
          .select("id,title,body,media_url,image_url,link_url,created_at,author_id")
          .eq("author_id", data.id)
          .order("created_at", { ascending: false })
          .limit(10);

        setPosts(postsData ?? []);
      } catch (e) {
        console.error("Error loading posts", e);
        setPosts([]);
      }
    } catch (e: any) {
      console.error("Error loading profile", e);
      setError(e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <section className="premium-card" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <LoadingState message="Loading profile..." />
        </section>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <section className="premium-card" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <ErrorState title="Profile not found" message={error || "The profile you're looking for doesn't exist."} onRetry={loadProfile} />
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/directory" className="gold-link">
              ← Back to directory
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <section className="premium-card" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <ProfileHeader profile={profile} />
        {profile.role === "business" && (profile.city || profile.state || profile.location) && (
          <div className="biz-map">
            <p className="biz-map-label">📍 Find us</p>
            <iframe
              title="Location map"
              className="biz-map-frame"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent([profile.full_name, profile.city, profile.state].filter(Boolean).join(" "))}&output=embed`}
            />
          </div>
        )}

        <div style={{ marginTop: "3rem" }}>
          <div className="page-search-row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 className="homepage-section-title" style={{ margin: 0, fontSize: "1.5rem" }}>Recent posts & media</h2>
            <Link href="/directory" className="gold-link">
              ← All professionals
            </Link>
          </div>

          {posts.length === 0 ? (
            <EmptyState title="No posts yet" message="This professional hasn't published any posts yet." icon="📝" />
          ) : (
            <div className="page-grid">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body}
                  post_type={post.post_type}
                  author_name={profile.full_name || profile.username}
                  author_id={post.author_id}
                  created_at={post.created_at}
                  media_url={post.media_url}
                  image_url={post.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
