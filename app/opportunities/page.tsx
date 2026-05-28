"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import OpportunityCard from "../components/opportunity-card";
import { LoadingState, EmptyState } from "../components/state-components";

type Opportunity = {
  id: string;
  title: string | null;
  organization: string | null;
  description: string | null;
  location: string | null;
  category: string | null;
  apply_link: string | null;
  deadline: string | null;
  featured: boolean;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const { data, error } = await (getSupabaseClient().from("opportunities") as any)
          .select("id,title,organization,description,location,category,apply_link,deadline,featured")
          .order("featured", { ascending: false })
          .order("deadline", { ascending: true });

        if (!error) {
          setOpportunities(data ?? []);
        }
      } catch (e) {
        console.error("Error loading opportunities", e);
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(opportunities.map((o) => o.category).filter(Boolean))) as string[]],
    [opportunities]
  );

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      const text = search.toLowerCase();
      const matchesSearch =
        !search ||
        [opp.title, opp.organization, opp.description, opp.location, opp.category]
          .filter(Boolean)
          .some((v) => v?.toLowerCase().includes(text));
      const matchesCategory = category === "all" || opp.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [opportunities, search, category]);

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px", minHeight: "100vh" }}>
        <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <LoadingState message="Loading opportunities..." />
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
            Opportunities
          </p>
          <h1 style={{ margin: "0 0 1rem 0", fontSize: "2.2rem" }}>
            Your next move is here
          </h1>
          <p className="muted" style={{ maxWidth: "700px", lineHeight: "1.6" }}>
            Casting calls, auditions, internships, grants, apprenticeships, collaborations, brand partnerships, and job openings from real organizations.
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities by title, organization, location..."
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

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            message="Try adjusting your search filters or check back soon for new opportunities."
            icon="🎯"
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                id={opp.id}
                title={opp.title}
                organization={opp.organization}
                description={opp.description}
                location={opp.location}
                category={opp.category}
                apply_link={opp.apply_link}
                deadline={opp.deadline}
                featured={opp.featured}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
