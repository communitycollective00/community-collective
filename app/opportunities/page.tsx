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
