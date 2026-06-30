"use client";
import { getCachedBg } from "../lib/background-cache";
import VideoEmbed from "./components/video-embed";
import FeaturedCarousel from "./components/featured-carousel";
import PostCard from "./components/post-card";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../lib/supabase";

interface Post {
  id: string; title: string; body: string; post_type: string;
  media_url: string | null; image_url: string | null; video_url: string | null;
  thumbnail_url: string | null; caption: string | null; location: string | null;
  tags: string[] | null; author_id: string; author_name: string;
  author_username: string | null; author_avatar: string | null; created_at: string;
  interview_guest_name: string | null; interview_guest_title: string | null;
  interview_guest_organization: string | null; interview_cover_url: string | null;
  interview_summary: string | null; interview_key_takeaways: string[] | null;
  media_type: string | null; status: string | null; visibility: string | null;
}

interface Slot {
  id: string; section: string; slot_index: number; title: string;
  role: string; city: string; description: string; image_url: string;
  link_url: string; is_active: boolean;
}

const FALLBACKS: Record<string, Slot[]> = {
  "Featured This Week": [
    { id: "f1", section: "Featured This Week", slot_index: 0, title: "Neighborhood Reporter", role: "Documentary Reporter", city: "Chicago", description: "A Chicago reporter capturing neighborhood resilience, trusted conversations, and the people who keep the story moving.", image_url: "", link_url: "/directory", is_active: true },
    { id: "f2", section: "Featured This Week", slot_index: 1, title: "Collective Builder", role: "Collective Organizer", city: "Indianapolis", description: "A local leader opening doors to shared spaces, resource networks, and the everyday work of building together.", image_url: "", link_url: "/directory", is_active: true },
    { id: "f3", section: "Featured This Week", slot_index: 2, title: "Neighborhood Youth Coach", role: "Mentorship Director", city: "Detroit", description: "A coach supporting young people in their first leadership roles, from neighborhood courts to community halls.", image_url: "", link_url: "/directory", is_active: true },
  ],
  "Real Game": [
    { id: "r1", section: "Real Game", slot_index: 0, title: "Street Law Clinic", role: "Attorney", city: "Chicago", description: "Practical legal knowledge rooted in everyday neighborhood experience and real-world cases.", image_url: "", link_url: "/voices", is_active: true },
    { id: "r2", section: "Real Game", slot_index: 1, title: "Neighborhood Venture", role: "Small Business Owner", city: "Atlanta", description: "The daily business decisions, relationships, and risks behind a local enterprise.", image_url: "", link_url: "/voices", is_active: true },
    { id: "r3", section: "Real Game", slot_index: 2, title: "Sound & Scene Studio", role: "Educator", city: "Michigan City", description: "A practical look at teaching, mentoring, and sharing skills in places that are often overlooked.", image_url: "", link_url: "/voices", is_active: true },
  ],
  "Opportunities Today": [
    { id: "o1", section: "Opportunities Today", slot_index: 0, title: "Neighborhood Block Grant", role: "Community Leader", city: "Chicago", description: "Immediate support and funding for neighborhood projects led by people who live and work locally.", image_url: "", link_url: "/opportunities", is_active: true },
    { id: "o2", section: "Opportunities Today", slot_index: 1, title: "Mentorship Session", role: "Youth Coach", city: "Gary", description: "A scheduled chance for young people to connect with guidance, networks, and real-world direction.", image_url: "", link_url: "/opportunities", is_active: true },
    { id: "o3", section: "Opportunities Today", slot_index: 2, title: "Community Artist Residency", role: "Cultural Producer", city: "Indianapolis", description: "Creative spaces and storytelling projects that support local artists and community memory.", image_url: "", link_url: "/opportunities", is_active: true },
  ],
  "People Building Things": [
    { id: "p1", section: "People Building Things", slot_index: 0, title: "Neighborhood Workshop", role: "Tradesman", city: "Gary", description: "A hands-on mentor teaching welding, carpentry, and the skilled trades that keep neighborhoods moving.", image_url: "", link_url: "/directory", is_active: true },
    { id: "p2", section: "People Building Things", slot_index: 1, title: "Community Story Archive", role: "Artist", city: "Michigan City", description: "A local storyteller documenting community rituals, daily work, and the relationships that shape a place.", image_url: "", link_url: "/directory", is_active: true },
    { id: "p3", section: "People Building Things", slot_index: 2, title: "Corner Store Collective", role: "Local Business Owner", city: "Atlanta", description: "A small business owner keeping commerce, support, and opportunity alive at the heart of the block.", image_url: "", link_url: "/directory", is_active: true },
  ],
  "Inside Access": [
    { id: "i1", section: "Inside Access", slot_index: 0, title: "Documentary Room", role: "Producer", city: "Chicago", description: "A behind-the-scenes look at how stories are gathered, edited, and shared with community audiences.", image_url: "", link_url: "/voices", is_active: true },
    { id: "i2", section: "Inside Access", slot_index: 1, title: "Community Table", role: "Faith Leader", city: "Indianapolis", description: "Trusted gatherings where neighbors, leaders, and service providers meet to exchange resources.", image_url: "", link_url: "/voices", is_active: true },
    { id: "i3", section: "Inside Access", slot_index: 2, title: "Resource Room", role: "Organizer", city: "Detroit", description: "A curated collection of doors, rooms, and introductions shaped for people building out of community.", image_url: "", link_url: "/voices", is_active: true },
  ],
  "Community Access": [
    { id: "c1", section: "Community Access", slot_index: 0, title: "Neighborhood Legal Aid", role: "Attorney", city: "Chicago", description: "Practical legal guidance for housing, records, and rights in everyday life.", image_url: "", link_url: "/get-access", is_active: true },
    { id: "c2", section: "Community Access", slot_index: 1, title: "Neighborhood Story Lab", role: "Documentarian", city: "Detroit", description: "Neighborhood stories captured through film, interviews, and cultural reporting.", image_url: "", link_url: "/get-access", is_active: true },
  ],
};

function getSlots(allSlots: Slot[], section: string): Slot[] {
  const live = allSlots.filter((s) => s.section === section && s.is_active);
  return live.length > 0 ? live : (FALLBACKS[section] || []);
}

function CCPlaceholder() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #15130d 0%, #0d0c08 60%, #1a1509 100%)", overflow: "hidden" }}>
      <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "3.5rem", letterSpacing: "0.05em", color: "transparent", background: "linear-gradient(135deg, rgba(245,217,122,0.22), rgba(201,168,76,0.10))", WebkitBackgroundClip: "text", backgroundClip: "text", userSelect: "none" }}>CC</span>
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)", border: "1px solid rgba(201,168,76,0.08)", pointerEvents: "none" }} />
    </div>
  );
}
function StoryCard({ slot }: { slot: Slot }) {
  const inner = (
    <div className="hp-card">
      <div className="hp-card-img" style={slot.image_url ? {
        backgroundImage: `url(${slot.image_url})`,
        backgroundSize: "cover", backgroundPosition: "center",
      } : {}}>
        {!slot.image_url && <CCPlaceholder />}
      </div>
      <div className="hp-card-body">
        <p className="hp-card-tag">{slot.section.toUpperCase()}</p>
        <h3 className="hp-card-title">{slot.title}</h3>
        <p className="hp-card-meta">{slot.role} · {slot.city}</p>
        <p className="hp-card-desc">{slot.description}</p>
      </div>
    </div>
  );
  return slot.link_url ? <Link href={slot.link_url}>{inner}</Link> : inner;
}

function WideCard({ slot }: { slot: Slot }) {
  const inner = (
    <div className="hp-wide-card">
      <div className="hp-wide-card-img" style={slot.image_url ? {
        backgroundImage: `url(${slot.image_url})`,
        backgroundSize: "cover", backgroundPosition: "center",
      } : {}}>
        {!slot.image_url && <CCPlaceholder />}
      </div>
      <div className="hp-wide-card-body">
        <p className="hp-card-tag">{slot.section.toUpperCase()}</p>
        <h3 className="hp-card-title">{slot.title}</h3>
        <p className="hp-card-meta">{slot.role} · {slot.city}</p>
        <p className="hp-card-desc">{slot.description}</p>
      </div>
    </div>
  );
  return slot.link_url ? <Link href={slot.link_url}>{inner}</Link> : inner;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [heroBg, setHeroBg] = useState<string>(() => getCachedBg("home"));
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [featuredSlot, setFeaturedSlot] = useState<any | null>(null);
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadAll();
  }, []);

  async function loadAll() {
    const supabase = getSupabaseClient();
    try {
      // 1. Background + slots in parallel — isolated so they always render
      const [slotsRes, bgRes, featRes, itemsRes] = await Promise.all([
        (supabase.from("homepage_slots") as any).select("*").order("slot_index"),
        (supabase.from("page_backgrounds") as any).select("*").eq("page_key", "home").limit(1),
        (supabase.from("featured_slot") as any).select("*").eq("id", "home").limit(1),
        (supabase.from("featured_items") as any).select("*").eq("slot_id", "home").order("sort_order"),
      ]);

      setSlots(slotsRes.data || []);

      const featRow = Array.isArray(featRes.data) ? featRes.data[0] : featRes.data;
      if (featRow?.is_active && featRow?.video_url) setFeaturedSlot(featRow);
      if (featRow?.is_active) {
        const its = (itemsRes.data || []);
        if (its.length) { setFeaturedItems(its); setFeaturedSlot(featRow); }
      }

      const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
      if (bgRow?.image_url) setHeroBg(bgRow.image_url);

    } catch (err) {
      console.error("Slots/bg fetch failed:", err);
    }

    // 2. Posts — separate try/catch so a failure here never kills bg/slots
    try {
      const { data: postsRaw } = await (supabase.from("posts") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      const postsData = (postsRaw || []).filter((p: any) =>
        (p.is_published === true || p.status === "published") &&
        (p.visibility === undefined || p.visibility === "public")
      );

      const authorIds = Array.from(new Set(
        postsData.map((p: any) => p.author_id || p.user_id).filter(Boolean)
      )) as string[];

      const { data: profiles } = await (supabase.from("profiles") as any)
        .select("id,full_name,username,avatar_url")
        .in("id", authorIds.length ? authorIds : ["none"]);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, {
          name: p.full_name || "Creator",
          username: p.username,
          avatar: p.avatar_url,
        }])
      );

      const fp = postsData.find((p: any) => p.post_type === "interview") || postsData[0] || null;
      setFeaturedPost(fp);
      setPosts(postsData.map((post: any) => {
        const authorId = post.author_id || post.user_id || "";
        const profile: any = profileMap.get(authorId) || { name: "Creator", username: null, avatar: null };
        return {
          ...post,
          author_id: authorId,
          author_name: profile.name,
          author_username: profile.username,
          author_avatar: profile.avatar,
        };
      }));
    } catch (err) {
      console.error("Posts fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (postId: string, saved: boolean) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (saved) {
      await (supabase.from("post_saves") as any).insert({ user_id: user.id, post_id: postId });
    } else {
      await (supabase.from("post_saves") as any).delete().eq("user_id", user.id).eq("post_id", postId);
    }
  };

  const handleShare = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const url = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      navigator.share({ title: "Culture Collective", text: post.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  return (
    <main className="premium-page homepage-main" style={{ paddingTop: "92px", position: "relative" }}>
      {heroBg && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", minHeight: "100vh", zIndex: 0, backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", backgroundAttachment: "local", pointerEvents: "none" }} />}
      {heroBg && <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", minHeight: "100vh", zIndex: 0, background: "linear-gradient(to bottom, rgba(12,11,8,0.45) 0%, rgba(12,11,8,0.65) 55%, rgba(12,11,8,0.92) 100%)", pointerEvents: "none" }} />}
      <section className="homepage-hero">
        <div className="homepage-hero-grid" />
        <div className="homepage-hero-glow" />
        <div className="homepage-hero-glow2" />
        <div className="homepage-hero-copy" style={{ position: "relative", zIndex: 2 }}>
          <div className="homepage-hero-ribbon">
            <span className="homepage-hero-ribbon-pulse" />
            <p>Now Accepting Founding Members — National</p>
          </div>
          <h1 className="homepage-hero-title">
            <span className="homepage-highlight">Real</span> people.<br />
            <span className="homepage-highlight--green">Real</span> knowledge.<br />
            <span className="homepage-highlight">Real</span> access.
          </h1>
          <p className="homepage-hero-text">A living archive of people doing meaningful work — storytelling, organizing, mentoring, and trusted access from communities on the move.</p>
          <div className="homepage-hero-actions">
            <Link href="/directory" className="gold-btn">Explore Directory</Link>
            <Link href="/apply" className="gold-link">Tap In</Link>
          </div>
        </div>
        <div className="homepage-featured-slot">
          {featuredItems.length > 0 ? (
            <FeaturedCarousel items={featuredItems} title={featuredSlot?.title} />
          ) : featuredPost ? (
            <Link href={`/posts/${featuredPost.id}`} className="homepage-featured-card" style={{ textDecoration: "none" }}>
              {(featuredPost.interview_cover_url || featuredPost.image_url) && (
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${featuredPost.interview_cover_url || featuredPost.image_url})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: "2px" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1) 100%)", borderRadius: "2px" }} />
              <div className="homepage-featured-body">
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.6rem", fontWeight: 700 }}>◆ Featured Interview</p>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: "0.5rem" }}>{featuredPost.interview_guest_name || featuredPost.title}</h3>
                {(featuredPost.interview_guest_title || featuredPost.interview_guest_organization) && (
                  <p style={{ fontSize: "0.75rem", color: "#C9A84C", marginBottom: "0.8rem" }}>{[featuredPost.interview_guest_title, featuredPost.interview_guest_organization].filter(Boolean).join(" · ")}</p>
                )}
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(201,168,76,0.4)", padding: "0.35rem 0.8rem", display: "inline-block" }}>Watch Now →</span>
              </div>
            </Link>
          ) : (
            <div className="homepage-featured-card homepage-featured-empty">
              <div className="homepage-featured-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", height: "100%" }}>
                <div style={{ width: 52, height: 52, border: "1px solid rgba(201,168,76,0.28)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem" }}>
                  <span style={{ color: "#C9A84C", fontSize: "1.3rem" }}>▶</span>
                </div>
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.75rem" }}>◆ Featured Interview</p>
                <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: "0.5rem" }}>First Interview<br />Dropping Tonight</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginTop: "0.5rem" }}>Culture Collective · Vol. 1</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {!loading && posts.length > 0 && (
        <section className="media-feed-section">
          <div className="media-feed-section-header">
            <h2>Recent Stories</h2>
            <a href="/posts" className="gold-link">View All →</a>
          </div>
          <div style={{ padding: "1rem" }}>
            {posts.map(p => (
              <PostCard
                key={p.id}
                id={p.id}
                title={p.title || p.caption}
                body={p.body}
                post_type={p.post_type}
                media_type={p.media_type}
                author_name={p.author_name}
                author_id={p.author_id}
                created_at={p.created_at}
                media_url={p.media_url}
                image_url={p.image_url}
                thumbnail_url={p.thumbnail_url}
              />
            ))}
          </div>
        </section>
      )}

            <div className="cc-stats-strip">
        <div className="cc-stat"><span className="cc-stat-num">2026</span><span className="cc-stat-lbl">Founded</span></div>
        <div className="cc-stat"><span className="cc-stat-num">2</span><span className="cc-stat-lbl">Cities</span></div>
        <div className="cc-stat"><span className="cc-stat-num">Open</span><span className="cc-stat-lbl">Network</span></div>
        <div className="cc-stat"><span className="cc-stat-num">Free</span><span className="cc-stat-lbl">Access</span></div>
      </div>
      <section className="hp-section fade-up">
        <div className="hp-section-head">
          <p className="hp-eyebrow">COMMUNITY STORIES</p>
          <h2 className="hp-section-title">ON THE RADAR</h2>
          <Link href="/directory" className="gold-btn hp-section-cta">FULL DIRECTORY →</Link>
        </div>
        <div className="hp-grid-3">
          {getSlots(slots, "Featured This Week").map((s, i) => <StoryCard key={i} slot={s} />)}
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-section fade-up">
        <div className="hp-section-split">
          <div className="hp-section-split-left">
            <p className="hp-eyebrow">REAL GAME</p>
            <h2 className="hp-section-title">WHAT THEY NEVER TAUGHT YOU.</h2>
            <p className="hp-section-body">From lawyers to CEOs, barbers to directors — real people sharing real knowledge. Updated daily.</p>
          </div>
          <div className="hp-grid-3">
            {getSlots(slots, "Real Game").map((s, i) => <StoryCard key={i} slot={s} />)}
          </div>
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-section fade-up">
        <div className="hp-section-head">
          <p className="hp-eyebrow">OPPORTUNITIES</p>
          <h2 className="hp-section-title">YOUR NEXT MOVE IS RIGHT HERE.</h2>
          <Link href="/opportunities" className="gold-btn hp-section-cta">SEE OPPORTUNITIES →</Link>
        </div>
        <div className="hp-grid-3">
          {getSlots(slots, "Opportunities Today").map((s, i) => <StoryCard key={i} slot={s} />)}
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-section fade-up">
        <div className="hp-section-head">
          <p className="hp-eyebrow">PEOPLE BUILDING THINGS</p>
          <h2 className="hp-section-title">THE COMMUNITIES MAKING PROGRESS RIGHT NOW.</h2>
        </div>
        <div className="hp-grid-wide">
          {getSlots(slots, "People Building Things").map((s, i) => <WideCard key={i} slot={s} />)}
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-section fade-up">
        <div className="hp-section-split">
          <div className="hp-section-split-left">
            <p className="hp-eyebrow">FROM THE INSIDE</p>
            <h2 className="hp-section-title">THE ROOMS YOU DON&apos;T USUALLY SEE.</h2>
            <p className="hp-section-body">Curated access to trusted spaces, verified rooms, and knowledge-based gatherings shaped for community stewards.</p>
          </div>
          <div className="hp-grid-3">
            {getSlots(slots, "Inside Access").map((s, i) => <StoryCard key={i} slot={s} />)}
          </div>
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-section fade-up">
        <div className="hp-grid-2">
          {getSlots(slots, "Community Access").map((s, i) => <WideCard key={i} slot={s} />)}
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-join-section">
        <div className="hp-join-inner">
          <p className="hp-eyebrow">YOU BELONG HERE</p>
          <h2 className="hp-join-title">
            <span style={{ color: "var(--gold)" }}>Real</span> people.<br />
            <span style={{ color: "var(--accent)" }}>Real</span> knowledge.<br />
            <span style={{ color: "var(--gold)" }}>Real</span> access.
          </h2>
          <p className="hp-join-body">Culture Collective is a living archive of people doing meaningful work — storytelling, organizing, mentoring, and trusted access from communities on the move.</p>
          <div className="hp-join-actions">
            <Link href="/directory" className="gold-btn">Explore Directory</Link>
            <Link href="/apply" className="gold-btn hp-join-btn-outline">Tap In</Link>
          </div>
          <div className="hp-join-badge">
            <span className="hp-join-badge-text">FREE</span>
            <span className="hp-join-badge-sub">TO JOIN</span>
          </div>
        </div>
      </section>

    </main>
  );
}