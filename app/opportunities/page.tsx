"use client";

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
      <main className="premium-page" style={{ paddingTop: "92px" }}>
        <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <LoadingState message="Loading opportunities..." />
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "92px" }}>
      <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p className="homepage-kicker">Opportunities</p>
          <h1 className="homepage-section-title">Your next move is here</h1>
          <p className="homepage-section-text">
            Casting calls, auditions, internships, grants, apprenticeships, collaborations, brand partnerships, and job openings from real organizations.
          </p>
        </div>

        <div className="page-search">
          <div className="page-search-row">
            <input
              className="page-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities by title, organization, location..."
            />
          </div>
          <div className="page-search-row">
            <select className="page-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            message="Try adjusting your search filters or check back soon for new opportunities."
            icon="🎯"
          />
        ) : (
          <div className="page-grid">
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
