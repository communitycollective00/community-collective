"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { isProfessionalRole } from "../../lib/roles";

type DirectoryProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  industry: string | null;
  category: string | null;
  location: string | null;
  avatar_url: string | null;
  role: string | null;
  posts?: Array<{ id: string; title: string | null; body: string | null; post_type: string | null; created_at: string | null }>;
};

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await (getSupabaseClient().from("profiles") as any)
        .select("id,full_name,username,bio,city,state,industry,category,location,avatar_url,role,posts(id,title,body,post_type,created_at)")
        .or("full_name.not.is.null,username.not.is.null")
        .order("full_name", { ascending: true });

      if (!error) setProfiles(data ?? []);
    };

    loadProfiles();
  }, []);

  const industryOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((profile) => profile.industry).filter(Boolean)))],
    [profiles]
  );
  const categoryOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((profile) => profile.category).filter(Boolean)))],
    [profiles]
  );
  const locationOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          profiles
            .map((profile) => profile.location || [profile.city, profile.state].filter(Boolean).join(", "))
            .filter(Boolean)
        )
      ),
    ],
    [profiles]
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const text = search.toLowerCase();
      const locationValue = profile.location || [profile.city, profile.state].filter(Boolean).join(", ");
      const matchesSearch = !search || [profile.full_name, profile.username, profile.bio, profile.industry, profile.category, locationValue]
        .some((value) => value?.toLowerCase().includes(text));
      const matchesIndustry = industry === "all" || profile.industry === industry;
      const matchesCategory = category === "all" || profile.category === category;
      const matchesLocation = location === "all" || locationValue === location;
      return matchesSearch && matchesIndustry && matchesCategory && matchesLocation;
    });
  }, [profiles, search, industry, category, location]);

  return (
    <main className="premium-page">
      <div className="premium-card directory-card">
        <section className="directory-hero">
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "12px" }}>The Directory</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.5rem, 4vw, 4.5rem)", lineHeight: 0.92, letterSpacing: "0.04em", margin: 0, color: "#F0EDE6", marginBottom: "18px" }}>Search trusted professionals.</h1>
            <p style={{ color: "#d3c18e", fontSize: "1rem", lineHeight: 1.8, maxWidth: "680px" }}>Find local experts, verified advisors, creators, and service providers by name, field, city, category, or need.</p>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div style={{ position: "relative", marginBottom: "22px" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#7c6b42", fontSize: "1.1rem" }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, field, city, category, or need..."
                style={{ width: "100%", padding: "1rem 1rem 1rem 48px", borderRadius: "16px", border: "1px solid rgba(200,157,53,0.18)", background: "rgba(12,10,7,0.85)", color: "#f4e8c1", fontSize: "1rem" }}
              />
            </div>
            <div className="directory-filters">
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                {industryOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All fields" : value}</option>)}
              </select>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoryOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All categories" : value}</option>)}
              </select>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                {locationOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All locations" : value}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", letterSpacing: "0.04em", marginBottom: "1rem", color: "#F0EDE6" }}>Verified professionals</h2>

          {filteredProfiles.length === 0 ? (
            <p className="muted">No profiles match your search yet. Try a broader query.</p>
          ) : (
            <div className="directory-grid">
              {filteredProfiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileCard({ profile }: { profile: DirectoryProfile }) {
  const latestPost = profile.posts?.slice().sort((a, b) => Number(new Date(b.created_at || "")) - Number(new Date(a.created_at || "")))[0];
  const locationValue = profile.location || [profile.city, profile.state].filter(Boolean).join(", ");

  return (
    <article className="directory-item">
      <div className="directory-item-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#f4e7c1" }}>{profile.full_name || profile.username}</p>
            <p style={{ margin: "0.35rem 0 0", color: "#c9b97a", fontSize: "0.85rem" }}>{profile.industry || profile.category || "Professional"}</p>
          </div>
          <span className="verify-badge">{isProfessionalRole(profile.role) ? "Verified" : "Member"}</span>
        </div>

        <div className="directory-meta">
          <span className="directory-badge">{profile.category || profile.industry || "General"}</span>
          <span className="directory-badge">{locationValue || "Location not listed"}</span>
          <span className="directory-badge">@{profile.username || "unknown"}</span>
        </div>

        <p style={{ margin: 0, color: "#d3c18e", lineHeight: 1.7, minHeight: "4.5rem" }}>{profile.bio || "Trusted professional profile."}</p>
        <p style={{ margin: "1rem 0 0", color: "#b8a370", fontSize: "0.85rem" }}>
          <strong style={{ color: "#c9a84c" }}>Latest:</strong> {latestPost ? (latestPost.title || latestPost.body?.slice(0, 75) || "Published media") : "No published content yet."}
        </p>

        <Link className="gold-link" href={`/directory/${profile.username}`} style={{ marginTop: "1rem", display: "inline-flex" }}>
          View profile
        </Link>
      </div>
    </article>
  );
}
