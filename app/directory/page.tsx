"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import ProfileCard from "../components/profile-card";
import { SearchHeader } from "../components/profile-header";
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

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [location, setLocation] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const { data, error } = await (getSupabaseClient().from("profiles") as any)
          .select("id,full_name,username,bio,city,state,industry,location,avatar_url,role,is_approved,is_featured")
          .neq("role", null)
          .order("is_featured", { ascending: false })
          .order("full_name", { ascending: true });

        if (!error) {
          setProfiles(data ?? []);
        }
      } catch (e) {
        console.error("Error loading profiles", e);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const industryOptions = useMemo(
    () => ["all", ...Array.from(new Set(profiles.map((p) => p.industry).filter(Boolean))) as string[]],
    [profiles]
  );

  const locationOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          profiles
            .map((p) => p.location || [p.city, p.state].filter(Boolean).join(", "))
            .filter(Boolean)
        )
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

  const filters = [
    {
      label: `Industry (${industryOptions.length - 1})`,
      value: industry,
      options: industryOptions,
      onChange: setIndustry,
    },
    {
      label: `Location (${locationOptions.length - 1})`,
      value: location,
      options: locationOptions,
      onChange: setLocation,
    },
  ];

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <section className="premium-card">
          <LoadingState message="Loading professional directory..." />
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "92px", minHeight: "100vh" }}>
      <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p
            className="muted"
            style={{
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.8rem",
              marginBottom: "0.5rem",
            }}
          >
            The Directory
          </p>
          <h1 style={{ margin: "0 0 1rem 0", fontSize: "2.2rem" }}>
            Search trusted professionals
          </h1>
          <p className="muted" style={{ maxWidth: "700px", lineHeight: "1.6" }}>
            Find verified creators, professionals, advisors, and service providers by name,
            field, location, and expertise.
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, field, location..."
            style={{
              width: "100%",
              padding: "1rem",
              background: "var(--s1)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "inherit",
              fontSize: "1rem",
              marginBottom: "1rem",
            }}
          />

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {filters.map((filter) => (
              <select
                key={filter.value}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--s1)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  color: "inherit",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                {filter.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "all" ? filter.label.split(" (")[0] : opt}
                  </option>
                ))}
              </select>
            ))}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
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
