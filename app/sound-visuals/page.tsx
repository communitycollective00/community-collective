"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import ProfileCard from "../components/profile-card";

type Listing = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  is_verified: boolean | null;
  lane: string | null;
  rail: string | null;
};

const RAILS: { key: string; label: string }[] = [
  { key: "artist", label: "Artists" },
  { key: "label", label: "Labels" },
  { key: "studio", label: "Studios" },
  { key: "producer", label: "Producers" },
  { key: "engineer", label: "Engineers" },
  { key: "photographer", label: "Photographers" },
  { key: "rep", label: "Reps & management" },
];

export default function SoundVisualsLanePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await (supabase.from("directory_listings") as any)
          .select("id,slug,name,category,city,state,bio,image_url,is_featured,is_verified,lane,rail")
          .eq("lane", "sound-visuals")
          .order("name", { ascending: true });
        setListings(data || []);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const featured = listings.find((l) => l.is_featured) || null;

  function toCard(l: Listing) {
    return (
      <ProfileCard
        key={l.id}
        id={l.id}
        full_name={l.name}
        username={l.slug}
        role="business"
        industry={l.category}
        bio={l.bio}
        avatar_url={l.image_url}
        is_featured={l.is_featured || false}
        is_approved={l.is_verified || false}
        city={l.city}
        state={l.state}
      />
    );
  }

  return (
    <main className="lane-page">
      <section className="lane-hero">
        <p className="lane-kicker">Lane</p>
        <h1 className="lane-title">Sound &amp; Visuals</h1>
        <p className="lane-tagline">The artists, studios, and image-makers shaping the culture — and the people who help them build.</p>
      </section>

      {loading ? (
        <p className="lane-empty">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="lane-empty">This lane is being built. Check back soon.</p>
      ) : (
        <>
          {featured && (
            <section className="lane-featured">
              <p className="lane-rail-label">Featured</p>
              <div className="lane-featured-grid">{toCard(featured)}</div>
            </section>
          )}

          {RAILS.map(({ key, label }) => {
            const items = listings.filter((l) => l.rail === key);
            if (items.length === 0) return null;
            return (
              <section className="lane-rail" key={key}>
                <div className="lane-rail-head">
                  <p className="lane-rail-label">{label}</p>
                </div>
                <div className="lane-rail-track">{items.map(toCard)}</div>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}
