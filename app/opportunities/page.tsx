"use client";
import { getCachedBg } from "../../lib/background-cache";

import { useEffect, useState, useMemo, useRef } from "react";
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

// Display metadata for known categories. Unknown categories still render
// with a sensible fallback, so new categories never break the grid.
const CATEGORY_META: Record<string, { icon: string; blurb: string }> = {
  "Rental Assistance": { icon: "\u{1F3E0}", blurb: "Help paying rent" },
  "Utility Assistance": { icon: "\u{1F4A1}", blurb: "Energy & utility bills" },
  "First-Time Homebuyer": { icon: "\u{1F511}", blurb: "Buy your first home" },
  "Housing Counseling": { icon: "\u{1F9ED}", blurb: "Free expert guidance" },
  "Unions & Building Trades": { icon: "\u{1F6E0}\uFE0F", blurb: "Join a trade" },
  "Apprenticeships": { icon: "\u{1F4D0}", blurb: "Earn while you learn" },
  "Land Banks": { icon: "\u{1F3DA}\uFE0F", blurb: "Affordable property" },
  "Start a Business": { icon: "\u{1F4BC}", blurb: "Form your LLC" },
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pageBg, setPageBg] = useState<string>(() => getCachedBg("opportunities"));
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of opportunities) {
      if (o.category) m[o.category] = (m[o.category] ?? 0) + 1;
    }
    return m;
  }, [opportunities]);

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

  const selectCategory = (cat: string) => {
    setCategory(cat);
    // Let state settle, then bring results into view.
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

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
      {/* scoped styles for the category grid - self-contained, won't touch globals */}
      <style>{`
        .cc-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.85rem;
          margin: 1.75rem 0 2.25rem;
        }
        .cc-cat-tile {
          text-align: left;
          cursor: pointer;
          background: rgba(15,12,8,0.72);
          border: 1px solid rgba(201,168,76,0.16);
          border-radius: 14px;
          padding: 1.05rem 1.1rem;
          color: #ece9e2;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transition: border-color .2s ease, transform .2s ease, background .2s ease;
        }
        .cc-cat-tile:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-3px); background: rgba(20,17,11,0.85); }
        .cc-cat-tile:focus-visible { outline: 2px solid #e7c97a; outline-offset: 2px; }
        .cc-cat-tile[data-active="true"] { border-color: #c9a84c; background: rgba(28,22,10,0.9); }
        .cc-cat-icon { font-size: 1.4rem; }
        .cc-cat-name { font-weight: 700; font-size: 1.02rem; color: #fff; line-height: 1.2; }
        .cc-cat-blurb { font-size: 0.82rem; color: rgba(255,255,255,0.55); }
        .cc-cat-count { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: #c9a84c; margin-top: 0.15rem; }
      `}</style>

      <section className="premium-card" style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <p className="homepage-kicker">Opportunities</p>
          <h1 className="homepage-section-title">Access creates opportunity. Opportunity changes trajectories.</h1>
          <p className="homepage-section-text">
            The action layer of Culture Collective: verified programs, applications, and entry points across housing,
            utilities, homeownership, the trades, and starting your own thing. Pick a path to jump in.
          </p>
        </div>

        {/* Clickable category navigation - drives the filter below */}
        <div className="cc-cat-grid" role="list" aria-label="Browse by category">
          <button
            className="cc-cat-tile"
            data-active={category === "all"}
            onClick={() => selectCategory("all")}
            role="listitem"
          >
            <span className="cc-cat-icon">{"\u2726"}</span>
            <span className="cc-cat-name">All paths</span>
            <span className="cc-cat-blurb">Everything in one place</span>
            <span className="cc-cat-count">{opportunities.length} listed</span>
          </button>

          {categories
            .filter((c) => c !== "all")
            .map((cat) => {
              const meta = CATEGORY_META[cat] ?? { icon: "\u2022", blurb: "" };
              return (
                <button
                  key={cat}
                  className="cc-cat-tile"
                  data-active={category === cat}
                  onClick={() => selectCategory(cat)}
                  role="listitem"
                >
                  <span className="cc-cat-icon">{meta.icon}</span>
                  <span className="cc-cat-name">{cat}</span>
                  {meta.blurb && <span className="cc-cat-blurb">{meta.blurb}</span>}
                  <span className="cc-cat-count">{counts[cat] ?? 0} {(counts[cat] ?? 0) === 1 ? "listing" : "listings"}</span>
                </button>
              );
            })}
        </div>

        {/* Search + redundant select (keyboard / accessibility) */}
        <div className="page-search" style={{ marginBottom: "1.5rem" }} ref={resultsRef}>
          <div className="page-search-row">
            <input
              className="page-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, organization, location, category..."
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
            title="Nothing here yet"
            message="Try another category or clear your search - new paths are added regularly."
            icon={"\u{1F680}"}
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