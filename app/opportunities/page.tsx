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

// Order categories render in (known first, any extras appended).
const CATEGORY_ORDER = [
  "First-Time Homebuyer",
  "Housing Counseling",
  "Rental Assistance",
  "Utility Assistance",
  "Land Banks",
  "Apprenticeships",
  "Unions & Building Trades",
  "Start a Business",
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pageBg, setPageBg] = useState<string>(() => getCachedBg("opportunities"));
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const incoming = new URLSearchParams(window.location.search).get("cat");
    if (incoming) setCategory(incoming);
  }, []);

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

  // categories present in the data, in our preferred order
  const categories = useMemo(() => {
    const present = new Set(opportunities.map((o) => o.category).filter(Boolean) as string[]);
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extras = [...present].filter((c) => !CATEGORY_ORDER.includes(c));
    return [...ordered, ...extras];
  }, [opportunities]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of opportunities) if (o.category) m[o.category] = (m[o.category] ?? 0) + 1;
    return m;
  }, [opportunities]);

  // search filter only — category is handled by which sections we render
  const searchFiltered = useMemo(() => {
    const text = search.toLowerCase();
    if (!text) return opportunities;
    return opportunities.filter((opp) =>
      [opp.title, opp.organization, opp.description, opp.location, opp.category]
        .filter(Boolean)
        .some((v) => v?.toLowerCase().includes(text))
    );
  }, [opportunities, search]);

  const catsToShow = category === "all" ? categories : [category];
  const totalShown = catsToShow.reduce(
    (n, c) => n + searchFiltered.filter((o) => o.category === c).length,
    0
  );

  const selectCategory = (cat: string) => {
    setCategory(cat);
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
      <style>{`
        .cc-cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.85rem; margin: 1.75rem 0 2.25rem; }
        .cc-cat-tile { text-align: left; cursor: pointer; background: rgba(15,12,8,0.72); border: 1px solid rgba(201,168,76,0.16); border-radius: 14px; padding: 1.05rem 1.1rem; color: #ece9e2; display: flex; flex-direction: column; gap: 0.35rem; transition: border-color .2s ease, transform .2s ease, background .2s ease; }
        .cc-cat-tile:hover { border-color: rgba(201,168,76,0.5); transform: translateY(-3px); background: rgba(20,17,11,0.85); }
        .cc-cat-tile:focus-visible { outline: 2px solid #e7c97a; outline-offset: 2px; }
        .cc-cat-tile[data-active="true"] { border-color: #c9a84c; background: rgba(28,22,10,0.9); }
        .cc-cat-icon { font-size: 1.4rem; }
        .cc-cat-name { font-weight: 700; font-size: 1.02rem; color: #fff; line-height: 1.2; }
        .cc-cat-blurb { font-size: 0.82rem; color: rgba(255,255,255,0.55); }
        .cc-cat-count { font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: #c9a84c; margin-top: 0.15rem; }
        .cc-cat-section { margin: 0 0 2.75rem; scroll-margin-top: 100px; }
        .cc-cat-section-head { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 1.1rem; padding-bottom: 0.6rem; border-bottom: 1px solid rgba(201,168,76,0.18); }
        .cc-cat-section-icon { font-size: 1.3rem; }
        .cc-cat-section-title { font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin: 0; }
        .cc-cat-section-blurb { font-size: 0.82rem; color: rgba(255,255,255,0.5); margin: 0 0 0 0.2rem; }
        .cc-cat-section-count { margin-left: auto; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: #c9a84c; border: 0.5px solid rgba(201,168,76,0.4); border-radius: 999px; padding: 0.18rem 0.65rem; white-space: nowrap; }
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

        {/* Clickable category navigation */}
        <div className="cc-cat-grid" role="list" aria-label="Browse by category">
          <button className="cc-cat-tile" data-active={category === "all"} onClick={() => selectCategory("all")} role="listitem">
            <span className="cc-cat-icon">{"\u2726"}</span>
            <span className="cc-cat-name">All paths</span>
            <span className="cc-cat-blurb">Everything, grouped</span>
            <span className="cc-cat-count">{opportunities.length} listed</span>
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat] ?? { icon: "\u2022", blurb: "" };
            return (
              <button key={cat} className="cc-cat-tile" data-active={category === cat} onClick={() => selectCategory(cat)} role="listitem">
                <span className="cc-cat-icon">{meta.icon}</span>
                <span className="cc-cat-name">{cat}</span>
                {meta.blurb && <span className="cc-cat-blurb">{meta.blurb}</span>}
                <span className="cc-cat-count">{counts[cat] ?? 0} {(counts[cat] ?? 0) === 1 ? "listing" : "listings"}</span>
              </button>
            );
          })}
        </div>

        {/* Search + redundant select */}
        <div className="page-search" style={{ marginBottom: "2rem" }} ref={resultsRef}>
          <div className="page-search-row">
            <input className="page-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, organization, location, category..." />
          </div>
          <div className="page-search-row">
            <select className="page-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
        </div>

        {/* Grouped category sections */}
        {totalShown === 0 ? (
          <EmptyState title="Nothing here yet" message="Try another category or clear your search - new paths are added regularly." icon={"\u{1F680}"} />
        ) : (
          catsToShow.map((cat) => {
            const rows = searchFiltered.filter((o) => o.category === cat);
            if (rows.length === 0) return null;
            const meta = CATEGORY_META[cat] ?? { icon: "\u2022", blurb: "" };
            return (
              <section key={cat} id={slugify(cat)} className="cc-cat-section">
                <div className="cc-cat-section-head">
                  <span className="cc-cat-section-icon">{meta.icon}</span>
                  <h2 className="cc-cat-section-title">{cat}</h2>
                  {meta.blurb && <span className="cc-cat-section-blurb">{meta.blurb}</span>}
                  <span className="cc-cat-section-count">{rows.length} {rows.length === 1 ? "listing" : "listings"}</span>
                </div>
                <div className="page-grid">
                  {rows.map((opp) => (
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
              </section>
            );
          })
        )}
      </section>
    </main>
  );
}