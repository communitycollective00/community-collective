"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthNavbar from "../components/auth-navbar";
import { getSupabaseClient } from "../../lib/supabase";

type DirectoryProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  industry: string | null;
  avatar_url: string | null;
  role: string | null;
  is_featured: boolean | null;
};

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [city, setCity] = useState("all");

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await (getSupabaseClient().from("profiles") as any)
        .select("id,display_name,username,bio,city,state,category,industry,avatar_url,role,is_featured")
        .not("username", "is", null)
        .order("is_featured", { ascending: false })
        .order("display_name", { ascending: true });

      if (!error) setProfiles(data ?? []);
    };

    loadProfiles();
  }, []);

  const industryOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((profile) => profile.category || profile.industry).filter(Boolean)))],
    [profiles]
  );
  const cityOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((profile) => profile.city).filter(Boolean)))],
    [profiles]
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesSearch = !search || [profile.display_name, profile.username, profile.bio].some((value) => value?.toLowerCase().includes(search.toLowerCase()));
      const matchesIndustry = industry === "all" || (profile.category || profile.industry) === industry;
      const matchesCity = city === "all" || profile.city === city;
      return matchesSearch && matchesIndustry && matchesCity;
    });
  }, [profiles, search, industry, city]);

  const is_featured = filteredProfiles.filter((profile) => profile.is_featured).slice(0, 3);

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card directory-card" style={{ marginTop: "2rem" }}>
        <p className="muted" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Community Collective</p>
        <h1 style={{ marginTop: 8 }}>Directory</h1>
        <p className="muted">Discover community members, verified experts, and local leaders.</p>

        <div className="directory-filters">
          <input placeholder="Search name, username, or bio" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {industryOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All industries" : value}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cityOptions.map((value) => <option key={value} value={value}>{value === "all" ? "All cities" : value}</option>)}
          </select>
        </div>

        {is_featured.length > 0 && (
          <>
            <h2 style={{ marginTop: "1.25rem" }}>Featured Profiles</h2>
            <div className="directory-grid">
              {is_featured.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}
            </div>
          </>
        )}

        <h2 style={{ marginTop: "1.25rem" }}>All Profiles</h2>
        <div className="directory-grid">
          {filteredProfiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)}
        </div>
      </section>
    </main>
  );
}

function ProfileCard({ profile }: { profile: DirectoryProfile }) {
  return (
    <article className="submission-item">
      <p style={{ margin: 0, fontWeight: 700 }}>
        {profile.display_name || profile.username}
        {profile.role && profile.role !== "community" ? <span className="verify-badge">{profile.role === "admin" ? "Admin" : "Verified"}</span> : null}
      </p>
      <p className="muted" style={{ marginTop: "0.25rem" }}>@{profile.username}</p>
      <p style={{ margin: "0.25rem 0" }}>{profile.bio || "No bio added yet."}</p>
      <p className="muted" style={{ margin: 0 }}>{profile.category || profile.industry || "General"} • {profile.city || "Unknown city"}</p>
      <Link className="gold-link" style={{ marginTop: "0.6rem" }} href={`/directory/${profile.username}`}>View profile</Link>
    </article>
  );
}
