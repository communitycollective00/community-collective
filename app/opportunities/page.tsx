"use client";
import { getCachedBg } from "../../lib/background-cache";

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

const opportunitySections = [
  { icon: "🎓", title: "Mentorship & Apprenticeships", copy: "Guided pathways that build skill, confidence, and real work experience with trusted people." },
  { icon: "🤝", title: "Collaborations & Community Projects", copy: "Local teams, creative work, and projects that connect people with shared purpose." },
  { icon: "💼", title: "Jobs, Grants & Support", copy: "Opportunities that move communities forward, not just listings that chase clicks." },
];

const opportunityTypes = [
  { icon: "🛠️", title: "Local work", copy: "Service, trades, and community-focused work where access creates real movement." },
  { icon: "📚", title: "Creative opportunity", copy: "Projects for storytellers, culture builders, and people making work with meaning." },
  { icon: "🌐", title: "Community opportunity", copy: "Programs, events, and collaborations that strengthen neighborhood infrastructure." },
  { icon: "🔗", title: "Pathway access", copy: "Access to networks, mentorship, and openings that change trajectories over time." },
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pageBg, setPageBg] = useState<string>(() => getCachedBg("opportunities"));

  useEffect(() => {
    const loadAll = async () => {
      try {
        const supabase = getSupabaseClient();

        const [bgRes, oppsRes] = await Promise.all([
          (supabase.from("page_backgrounds") as any).select("*").eq("page_key", "opportunities").limit(1),
          (supabase.from("opportunities") as any)
            .select("id,title,organization,description,location,category,apply_link,deadline,featured")
            .order("featured", { ascending: false })
            .order("deadline", { ascending: true }),
        ]);

        const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
        if (bgRow?.image_url) setPageBg(bgRow.image_url);

        if (!oppsRes.error) setOpportunities(oppsRes.data ?? []);
      } catch (e) {
        console.error("Error loading opportunities", e);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
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

  const bgStyle = pageBg
    ? { backgroundImage: `url(${pageBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundAttachment: "fixed" }
    : {};

  if (loading) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px", ...bgStyle }}>
        <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <LoadingState message="Loading opportunities..." />
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "92px", ...bgStyle }}>
      <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p className="homepage-kicker">Opportunities</p>
          <h1 className="homepage-section-title">Access creates opportunity. Opportunity changes trajectories.</h1>
          <p className="homepage-section-text">
            The action layer of Culture Collective is where trust meets movement: mentorship, work, creative projects, and local openings that connect people to the opportunity network.
          </p>
        </div>

        <div className="homepage-section-grid homepage-section-grid--split" style={{ gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <p className="homepage-feature-title">What exists here</p>
            <p className="homepage-feature-copy">
              This isn't a generic job board. It is a place for people seeking mentorship, apprenticeships, collaborations, grants, and work that comes from community access.
            </p>
            <div className="homepage-grid-3" style={{ gap: "1rem", marginTop: "1.5rem" }}>
              {opportunitySections.map((section) => (
                <div key={section.title} className="homepage-feature-card">
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{section.icon}</div>
                  <p className="homepage-feature-title">{section.title}</p>
                  <p className="homepage-feature-copy">{section.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="homepage-section homepage-section--dark" style={{ padding: "1.75rem", borderRadius: "18px" }}>
            <p className="homepage-kicker">Why this matters</p>
            <p className="homepage-section-text">
              Culture Collective surfaces opportunities that come from trusted relationships, verified voices, and real local momentum — not anonymous listings and algorithm-driven noise.
            </p>
            <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
              <p className="homepage-feature-copy">• Opportunity is created when access is real, visible, and shared intentionally.</p>
              <p className="homepage-feature-copy">• Every opening here is part of a network built around people, mentorship, and community trajectory.</p>
              <p className="homepage-feature-copy">• You can connect to jobs, creative work, funding pathways, and community-led projects in one trusted place.</p>
            </div>
          </div>
        </div>

        <div className="homepage-grid-3" style={{ gap: "1rem", marginBottom: "2rem" }}>
          {opportunityTypes.map((type) => (
            <div key={type.title} className="homepage-feature-card">
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{type.icon}</div>
              <p className="homepage-feature-title">{type.title}</p>
              <p className="homepage-feature-copy">{type.copy}</p>
            </div>
          ))}
        </div>

        <div className="page-search" style={{ marginBottom: "2rem" }}>
          <div className="page-search-row">
            <input
              className="page-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities by title, location, category..."
            />
          </div>
          <div className="page-search-row">
            <select className="page-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === "all" ? "All categories" : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            message="Try adjusting your filters or check back soon for new openings that match your path."
            icon="🚀"
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