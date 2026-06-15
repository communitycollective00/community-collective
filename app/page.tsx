"use client";
import PostCard from "./components/post-card";
import { useEffect, useState, useRef} from "react";
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

// Fallback static data — used only when no slot data exists in Supabase
const FALLBACKS: Record<string, Slot[]> = {
  "Featured This Week": [
    { id: "f1", section: "Featured This Week", slot_index: 0, title: "Neighborhood Reporter", role: "Documentary Reporter", city: "Chicago", description: "A Chicago reporter capturing neighborhood resilience, trusted conversations, and the people who keep the story moving.", image_url: "", link_url: "", is_active: true },
    { id: "f2", section: "Featured This Week", slot_index: 1, title: "Collective Builder", role: "Collective Organizer", city: "Indianapolis", description: "A local leader opening doors to shared spaces, resource networks, and the everyday work of building together.", image_url: "", link_url: "", is_active: true },
    { id: "f3", section: "Featured This Week", slot_index: 2, title: "Neighborhood Youth Coach", role: "Mentorship Director", city: "Detroit", description: "A coach supporting young people in their first leadership roles, from neighborhood courts to community halls.", image_url: "", link_url: "", is_active: true },
  ],
  "Real Game": [
    { id: "r1", section: "Real Game", slot_index: 0, title: "Street Law Clinic", role: "Attorney", city: "Chicago", description: "Practical legal knowledge rooted in everyday neighborhood experience and real-world cases.", image_url: "", link_url: "", is_active: true },
    { id: "r2", section: "Real Game", slot_index: 1, title: "Neighborhood Venture", role: "Small Business Owner", city: "Atlanta", description: "The daily business decisions, relationships, and risks behind a local enterprise.", image_url: "", link_url: "", is_active: true },
    { id: "r3", section: "Real Game", slot_index: 2, title: "Sound & Scene Studio", role: "Educator", city: "Michigan City", description: "A practical look at teaching, mentoring, and sharing skills in places that are often overlooked.", image_url: "", link_url: "", is_active: true },
  ],
  "Opportunities Today": [
    { id: "o1", section: "Opportunities Today", slot_index: 0, title: "Neighborhood Block Grant", role: "Community Leader", city: "Chicago", description: "Immediate support and funding for neighborhood projects led by people who live and work locally.", image_url: "", link_url: "", is_active: true },
    { id: "o2", section: "Opportunities Today", slot_index: 1, title: "Mentorship Session", role: "Youth Coach", city: "Gary", description: "A scheduled chance for young people to connect with guidance, networks, and real-world direction.", image_url: "", link_url: "", is_active: true },
    { id: "o3", section: "Opportunities Today", slot_index: 2, title: "Community Artist Residency", role: "Cultural Producer", city: "Indianapolis", description: "Creative spaces and storytelling projects that support local artists and community memory.", image_url: "", link_url: "", is_active: true },
  ],
  "People Building Things": [
    { id: "p1", section: "People Building Things", slot_index: 0, title: "Neighborhood Workshop", role: "Tradesman", city: "Gary", description: "A hands-on mentor teaching welding, carpentry, and the skilled trades that keep neighborhoods moving.", image_url: "", link_url: "", is_active: true },
    { id: "p2", section: "People Building Things", slot_index: 1, title: "Community Story Archive", role: "Artist", city: "Michigan City", description: "A local storyteller documenting community rituals, daily work, and the relationships that shape a place.", image_url: "", link_url: "", is_active: true },
    { id: "p3", section: "People Building Things", slot_index: 2, title: "Corner Store Collective", role: "Local Business Owner", city: "Atlanta", description: "A small business owner keeping commerce, support, and opportunity alive at the heart of the block.", image_url: "", link_url: "", is_active: true },
  ],
  "Inside Access": [
    { id: "i1", section: "Inside Access", slot_index: 0, title: "Documentary Room", role: "Producer", city: "Chicago", description: "A behind-the-scenes look at how stories are gathered, edited, and shared with community audiences.", image_url: "", link_url: "", is_active: true },
    { id: "i2", section: "Inside Access", slot_index: 1, title: "Community Table", role: "Faith Leader", city: "Indianapolis", description: "Trusted gatherings where neighbors, leaders, and service providers meet to exchange resources.", image_url: "", link_url: "", is_active: true },
    { id: "i3", section: "Inside Access", slot_index: 2, title: "Resource Room", role: "Organizer", city: "Detroit", description: "A curated collection of doors, rooms, and introductions shaped for people building out of community.", image_url: "", link_url: "", is_active: true },
  ],
  "Community Access": [
    { id: "c1", section: "Community Access", slot_index: 0, title: "Neighborhood Legal Aid", role: "Attorney", city: "Chicago", description: "Practical legal guidance for housing, records, and rights in everyday life.", image_url: "", link_url: "", is_active: true },
    { id: "c2", section: "Community Access", slot_index: 1, title: "Neighborhood Story Lab", role: "Documentarian", city: "Detroit", description: "Neighborhood stories captured through film, interviews, and cultural reporting.", image_url: "", link_url: "", is_active: true },
  ],
};

function getSlots(allSlots: Slot[], section: string): Slot[] {
  const live = allSlots.filter((s) => s.section === section && s.is_active);
  return live.length > 0 ? live : (FALLBACKS[section] || []);
}

function StoryCard({ slot }: { slot: Slot }) {
  const inner = (
    <div className="hp-card">
      <div className="hp-card-img" style={slot.image_url ? {
        backgroundImage: `url(${slot.image_url})`,
        backgroundSize: "cover", backgroundPosition: "center",
      } : {}}>
        {!slot.image_url && <span>Image Placeholder</span>}
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
        {!slot.image_url && <span>Image Placeholder</span>}
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
  const [heroBg, setHeroBg] = useState<string>("");
  const [loading, setLoading] = useState(true);

const hasFetched = useRef(false);
  useEffect(() => { 
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadAll(); 
  }, []);
  async function loadAll() {
    try {
      const supabase = getSupabaseClient();

      // Parallel fetch — posts + profiles + slots + background
      const [postsRes, slotsRes, bgRes] = await Promise.all([
        (supabase.from("posts") as any)
          .select("*").order("created_at", { ascending: false }).limit(20),
        (supabase.from("homepage_slots") as any)
          .select("*").order("slot_index"),
        (supabase.from("page_backgrounds") as any)
          .select("*").eq("page_key", "home").single(),
      ]);

      // Background
      console.log("BG RES:", bgRes.data, bgRes.error);
const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
if (bgRow?.image_url) setHeroBg(bgRow.image_url);
      // Slots
      setSlots(slotsRes.data || []);

      // Posts + author resolution
      const postsData = (postsRes.data || []).filter((p: any) =>
        (p.is_published === true || p.status === "published") &&
        (p.visibility === undefined || p.visibility === "public")
      );
      const authorIds = Array.from(new Set(
        postsData.map((p: any) => p.author_id || p.user_id).filter(Boolean)
      ));
      const { data: profiles } = await (supabase.from("profiles") as any)
        .select("id,full_name,username,avatar_url")
        .in("id", authorIds.length ? authorIds : ["none"]);
      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.id, { name: p.full_name || "Creator", username: p.username, avatar: p.avatar_url }])
      );
      setPosts(postsData.map((post: any) => {
        const authorId = post.author_id || post.user_id || "";
        const profile: any = profileMap.get(authorId) || { name: "Creator", username: null, avatar: null };
        return { ...post, author_id: authorId, author_name: profile.name, author_username: profile.username, author_avatar: profile.avatar };
      }));
    } catch (err) {
      console.error("Failed to load homepage:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (postId: string, saved: boolean) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (saved) { await (supabase.from("post_saves") as any).insert({ user_id: user.id, post_id: postId }); }
    else { await (supabase.from("post_saves") as any).delete().eq("user_id", user.id).eq("post_id", postId); }
  };

  const handleShare = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const url = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) { navigator.share({ title: "Community Collective", text: post.title, url }); }
    else { navigator.clipboard.writeText(url); alert("Link copied!"); }
  };

  return (
    <main className="premium-page homepage-main" style={{ paddingTop: "92px" }}>

     <section className="homepage-hero">
        {heroBg && (
          <img
            src={heroBg}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              zIndex: 0,
            }}
          />
        )}
        <div className="homepage-hero-bg" /><div className="homepage-hero-grid" />
        <div className="homepage-hero-glow" /><div className="homepage-hero-glow2" />
        <div className="homepage-hero-copy">
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
      </section>

      <div className="ticker-wrap homepage-ticker">
        <div className="ticker-track">
          {["Game Daily","HUD Programs","Casting Calls","Verified Professionals","From The Inside","Opportunities","Stories","Community","Game Daily","HUD Programs","Casting Calls","Verified Professionals","From The Inside","Opportunities","Stories","Community"].map((item, i) => (
            <span key={i}><span className="ticker-item">{item}</span><span className="tdot">◆</span></span>
          ))}
        </div>
      </div>

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

      <section className="hp-section">
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

      <section className="hp-section">
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

      <section className="hp-section">
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

      <section className="hp-section">
        <div className="hp-section-head">
          <p className="hp-eyebrow">PEOPLE BUILDING THINGS</p>
          <h2 className="hp-section-title">THE COMMUNITIES MAKING PROGRESS RIGHT NOW.</h2>
        </div>
        <div className="hp-grid-wide">
          {getSlots(slots, "People Building Things").map((s, i) => <WideCard key={i} slot={s} />)}
        </div>
      </section>

      <div className="hp-divider" />

      <section className="hp-section">
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

      <section className="hp-section">
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
          <p className="hp-join-body">Community Collective is a living archive of people doing meaningful work — storytelling, organizing, mentoring, and trusted access from communities on the move.</p>
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