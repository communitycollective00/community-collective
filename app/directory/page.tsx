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
  avatar_url: string | null;
  role: string | null;
  posts?: Array<{ id: string; title: string | null; body: string | null; post_type: string | null; created_at: string | null }>;
};

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [city, setCity] = useState("all");

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await (getSupabaseClient().from("profiles") as any)
        .select("id,full_name,username,bio,city,state,industry,avatar_url,role,posts(id,title,body,post_type,created_at)")
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
  const cityOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((profile) => profile.city).filter(Boolean)))],
    [profiles]
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesSearch = !search || [profile.full_name, profile.username, profile.bio].some((value) => value?.toLowerCase().includes(search.toLowerCase()));
      const matchesIndustry = industry === "all" || profile.industry === industry;
      const matchesCity = city === "all" || profile.city === city;
      return matchesSearch && matchesIndustry && matchesCity;
    });
  }, [profiles, search, industry, city]);

  return (
    <main className="premium-page">
      <section className="premium-card directory-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Professional Directory</p>
        <h1 style={{ marginTop: 8 }}>Directory</h1>
        <p className="muted">Browse trusted professionals, verified organizations, and the latest expert content previews.</p>

        <div className="directory-filters">
          <input placeholder="Search name, username, or expertise" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {industryOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All industries" : value}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cityOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All cities" : value}</option>)}
          </select>
        </div>

        <h2 style={{ marginTop: "1.25rem" }}>Verified professionals</h2>
        {filteredProfiles.length === 0 ? (
          <p className="muted">No profiles found yet.</p>
        ) : (
          <div className="directory-grid">
            {filteredProfiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function ProfileCard({ profile }: { profile: DirectoryProfile }) {
  const latestPost = profile.posts?.slice().sort((a, b) => Number(new Date(b.created_at || "")) - Number(new Date(a.created_at || "")))[0];
  return (
    <article className="submission-item">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{profile.full_name || profile.username}</p>
        {isProfessionalRole(profile.role) ? <span className="verify-badge">Verified</span> : null}
      </div>
      <p className="muted" style={{ marginTop: "0.25rem" }}>@{profile.username || "unknown"}</p>
      <p style={{ margin: "0.35rem 0" }}>{profile.bio || "Trusted professional profile."}</p>
      <p className="muted" style={{ margin: 0 }}>{profile.industry || "General"} • {profile.city || "Location not listed"}</p>
      <p className="muted" style={{ margin: "0.75rem 0 0" }}>
        <strong>Latest content:</strong> {latestPost ? (latestPost.title || latestPost.body?.slice(0, 80) || "Published media") : "No published content yet."}
      </p>
      <Link className="gold-link" style={{ marginTop: "0.6rem" }} href={`/directory/${profile.username}`}>View profile</Link>
    </article>
  );
}
