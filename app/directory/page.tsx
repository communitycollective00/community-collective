"use client";
import { getCachedBg } from "../../lib/background-cache";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import ProfileCard from "../components/profile-card";
import { LoadingState, EmptyState } from "../components/state-components";

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
  is_approved?: boolean;
  is_featured?: boolean;
};

const directoryHighlights = [
  { icon: "🛠️", title: "Skilled trades", copy: "People who turn experience into work, income, and local impact." },
  { icon: "🧑‍🏫", title: "Educators", copy: "Trusted teachers, trainers, and coaches who share what they know with care." },
  { icon: "⚖️", title: "Attorneys", copy: "Real legal guidance from people who understand systems and community rights." },
  { icon: "🎨", title: "Creators", copy: "Storytellers, media makers, and artists using their work to build access." },
  { icon: "🤝", title: "Organizers", copy: "Leaders and connectors who build trusted community relationships." },
  { icon: "📈", title: "Business owners", copy: "People growing local enterprise with expertise rooted in real people and places." },
];

const accessStatements = [
  "Access is a relationship, not a resume.",
  "The right introduction can change everything.",
  "Verified expertise and local knowledge make every connection more valuable.",
];

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [location, setLocation] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pageBg, setPageBg] = useState<string>(() => getCachedBg("directory"));

  useEffect(() => {
    const loadAll = async () => {
      try {
        const supabase = getSupabaseClient();

        const [bgRes, profilesRes] = await Promise.all([
          (supabase.from("page_backgrounds") as any).select("*").eq("page_key", "directory").limit(1),
          (supabase.from("profiles") as any)
            .select("id,full_name,username,bio,city,state,industry,location,avatar_url,role,is_approved,is_featured")
            .neq("role", null)
            .order("is_featured", { ascending: false })
            .order("full_name", { ascending: true }),
        ]);

        const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
        if (bgRow?.image_url) setPageBg(bgRow.image_url);

        if (!profilesRes.error) setProfiles(profilesRes.data ?? []);
      } catch (e) {
        console.error("Error loading directory", e);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const industryOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((p) => p.industry).filter(Boolean))) as string[]],
    [profiles]
  );

  const locationOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(profiles.map((p) => p.location || [p.city, p.state].filter(Boolean).join(", ")).filter(Boolean))
      ) as string[],
    ],
    [profiles]
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const text = search.toLowerCase();
      const locationValue = profile.location || [profile.city, profile.state].filter(Boolean).join(", ");
      const matchesSearch =
        !search ||
        [profile.full_name, profile.username, profile.bio, profile.industry, locationValue]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(text));
      const matchesIndustry = industry === "all" || profile.industry === industry;
      const matchesLocation = location === "all" || locationValue === location;
      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [profiles, search, industry, location]);

  const bgStyle = pageBg
    ? { backgroundImage: `url(${pageBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundAttachment: "fixed" }
    : {};

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px", ...bgStyle }}>
        <section className="premium-card">
          <LoadingState message="Loading professional directory..." />
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "92px", ...bgStyle }}>
      <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div className="homepage-section-grid homepage-section-grid--split" style={{ gap: "2.5rem", marginBottom: "2rem" }}>
          <div>
            <p className="homepage-kicker">The Directory</p>
            <h1 className="homepage-section-title">Access is a relationship. The right introduction can change everything.</h1>
            <p className="homepage-section-text">
              This directory is the engine behind Culture Collective. Here you find trusted professionals, local experts, mentors, creators, organizers, educators, and leaders who make access meaningful.
            </p>
            <div className="homepage-grid-3" style={{ gap: "1rem", marginTop: "1.5rem" }}>
              {directoryHighlights.map((highlight) => (
                <div key={highlight.title} className="homepage-feature-card">
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{highlight.icon}</div>
                  <p className="homepage-feature-title">{highlight.title}</p>
                  <p className="homepage-feature-copy">{highlight.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="homepage-section homepage-section--dark" style={{ padding: "1.75rem", borderRadius: "18px" }}>
            <p className="homepage-kicker">Why this directory matters</p>
            <p className="homepage-section-text">
              Culture Collective is not LinkedIn. It is a trusted access network where introductions are rooted in community impact, lived expertise, and verified relationships.
            </p>
            <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
              {accessStatements.map((statement) => (
                <p key={statement} className="homepage-feature-copy">{statement}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="page-search" style={{ marginBottom: "2rem" }}>
          <div className="page-search-row">
            <input
              className="page-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, expertise, or location..."
            />
          </div>
          <div className="page-search-row">
            <select className="page-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {industryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === "all" ? "All industries" : opt}</option>
              ))}
            </select>
            <select className="page-select" value={location} onChange={(e) => setLocation(e.target.value)}>
              {locationOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === "all" ? "All locations" : opt}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredProfiles.length === 0 ? (
          <EmptyState
            title="No professionals found"
            message="Try adjusting your search filters or browse all professionals."
            icon="🔍"
            action={{ label: "Clear filters", href: "/directory" }}
          />
        ) : (
          <div className="directory-grid">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                id={profile.id}
                full_name={profile.full_name}
                username={profile.username}
                role={profile.role}
                industry={profile.industry}
                bio={profile.bio}
                avatar_url={profile.avatar_url}
                is_featured={profile.is_featured}
                is_approved={profile.is_approved}
                city={profile.city}
                state={profile.state}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}