"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import OpportunityCard from "./opportunity-card";

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

// Homepage section that pulls live rows from the `opportunities` table.
// Drop <OpportunitiesHomeSection /> anywhere in app/page.tsx.
// Shows featured first, then newest; hides itself if there's nothing to show.
export default function OpportunitiesHomeSection() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const res = await (supabase.from("opportunities") as any)
          .select("id,title,organization,description,location,category,apply_link,deadline,featured")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(6);
        if (!res.error) setItems(res.data ?? []);
      } catch (e) {
        console.error("Error loading homepage opportunities", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="hp-section">
      <div className="hp-section-head">
        <p className="hp-eyebrow">Pathways</p>
        <h2 className="hp-section-title">Opportunities</h2>
        <p className="hp-section-body">
          Verified programs and entry points across housing, the trades, and starting your own thing.
        </p>
      </div>

      <div className="hp-grid-3">
        {items.map((o) => (
          <OpportunityCard
            key={o.id}
            id={o.id}
            title={o.title}
            organization={o.organization}
            description={o.description}
            location={o.location}
            category={o.category}
            apply_link={o.apply_link}
            deadline={o.deadline}
            featured={o.featured}
          />
        ))}
      </div>

      <div style={{ marginTop: "1.75rem" }}>
        <a
          href="/opportunities"
          style={{ color: "#c9a84c", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}
        >
          View all opportunities {"\u2192"}
        </a>
      </div>
    </section>
  );
}