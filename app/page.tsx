"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";
import PostCard from "./components/post-card";

const realKnowledgeItems = [
  {
    icon: "⚖️",
    title: "Legal Game",
    copy: "Know your rights, protect your future, and navigate systems with confidence.",
  },
  {
    icon: "💰",
    title: "Business & Funding",
    copy: "Real-world financial moves and business strategies for building lasting community wealth.",
  },
  {
    icon: "🎬",
    title: "Media & Storytelling",
    copy: "Behind-the-scenes stories, production rooms, and the culture moments that matter.",
  },
];

const opportunityItems = [
  {
    icon: "🎬",
    title: "Casting Calls",
    copy: "Curated open calls from verified productions and media teams.",
  },
  {
    icon: "💼",
    title: "Internships & Grants",
    copy: "Practical pathways for people building business, culture, and community impact.",
  },
  {
    icon: "🛠️",
    title: "Collaborations",
    copy: "Partnerships, brand opportunities, and paid projects from trusted organizations.",
  },
];

const spotlightItems = [
  {
    title: "Odom Law Group",
    tag: "Keisha Odom, Esq. · Chicago",
    copy: "Clearing records, restoring access, and creating pathways for stability.",
  },
  {
    title: "Clarity Media Studio",
    tag: "Jordan L. · Chicago",
    copy: "Authentic storytelling for community brands and culture-driven projects.",
  },
  {
    title: "Blackstreet Barber Co.",
    tag: "Marcus T. · Detroit",
    copy: "Freestyle workshops, career connections, and tools for local entrepreneurship.",
  },
];

const happeningsItems = [
  {
    icon: "📍",
    title: "Community Mixer",
    copy: "Monthly meetup for members, partners, and professionals to connect in person.",
  },
  {
    icon: "⚖️",
    title: "Legal Game Workshop",
    copy: "Free rights and expungement coaching sessions for members and neighbors.",
  },
  {
    icon: "🎬",
    title: "Media Story Night",
    copy: "A documentary showcase and networking circle for creators and storytellers.",
  },
];

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        const { data: postsData } = await (getSupabaseClient().from("posts") as any)
          .select("id,title,body,post_type,media_url,image_url,link_url,created_at,author_id")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        // Fetch author info for each post
        if (postsData && postsData.length > 0) {
          const authorIds = [...new Set(postsData.map((p) => p.author_id))];
          const { data: authorsData } = await (getSupabaseClient().from("profiles") as any)
            .select("id,full_name,username")
            .in("id", authorIds);

          const authorMap = Object.fromEntries(
            (authorsData || []).map((a) => [a.id, a])
          );

          const enrichedPosts = postsData.map((p) => ({
            ...p,
            author: authorMap[p.author_id] || { full_name: "Anonymous", username: null },
          }));

          setRecentPosts(enrichedPosts);
        }
      } catch (err) {
        console.error("[Homepage] Failed to load recent posts:", err);
      }
    };

    loadRecentPosts();
  }, []);

  return (
    <main className="premium-page homepage-main" style={{ paddingTop: "92px" }}>
      <div className="homepage-content">
        <section className="homepage-hero">
          <div className="homepage-hero-bg" />
          <div className="homepage-hero-grid" />
          <div className="homepage-hero-glow" />
          <div className="homepage-hero-glow2" />

          <div className="homepage-hero-copy">
            <div className="homepage-hero-ribbon">
              <span className="homepage-hero-ribbon-pulse" />
              <p>Now Accepting Founding Members — National</p>
            </div>
            <h1 className="homepage-hero-title">
              REAL <span className="homepage-highlight">PEOPLE.</span>
              <br />
              REAL <span className="homepage-highlight homepage-highlight--green">KNOWLEDGE.</span>
              <br />
              REAL <span className="homepage-highlight">ACCESS.</span>
            </h1>
            <p className="homepage-hero-text">
              A trusted ecosystem where top lawyers post free legal game, professionals from every walk of life share real knowledge, and communities finally get access to the rooms, people, and opportunities that were always there — just never for them.
            </p>
            <div className="homepage-hero-actions">
              <Link href="/directory" className="gold-btn">
                Explore Directory
              </Link>
              <Link href="/get-access" className="gold-link">
                Get Access
              </Link>
            </div>
            <div className="homepage-hero-pill">
              <span className="homepage-hero-pill-number">Free</span>
              <span className="homepage-hero-pill-label">To Join</span>
            </div>
          </div>
        </section>

        <div className="ticker-wrap homepage-ticker">
          <div className="ticker-track">
            <span className="ticker-item">Real People</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Real Knowledge</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Real Access</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Know Your Rights</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Free Legal Game Daily</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">HUD Programs</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Casting Calls</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Verified Professionals</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Inside Access</span>
            <span className="tdot">◆</span>
            <span className="ticker-item">Community First</span>
            <span className="tdot">◆</span>
          </div>
        </div>

        <section className="homepage-section">
          <div className="homepage-section-grid homepage-section-grid--split">
            <div>
              <p className="homepage-kicker">What This Is</p>
              <h2 className="homepage-section-title">Not just a platform. An ecosystem.</h2>
              <p className="homepage-section-text">
                This is a trust-based access network powered by real people and real media. Not content-first. Not social-first. <strong>Access-first.</strong> Everything else — media, opportunities, profiles — is evidence of that access.
              </p>
              <div className="homepage-feature-list">
                <div className="homepage-feature-card">
                  <span>◆</span>
                  <div>
                    <p className="homepage-feature-title">Professionals Teach</p>
                    <p className="homepage-feature-copy">Selected, verified professionals post real knowledge daily. Legal rights, financial game, health, trades — the stuff people need before it's too late.</p>
                  </div>
                </div>
                <div className="homepage-feature-card">
                  <span>◆</span>
                  <div>
                    <p className="homepage-feature-title">Culture Gets Documented</p>
                    <p className="homepage-feature-copy">Backstage moments, raw conversations, overlooked voices — documented with intention. A long-term media archive with real cultural value.</p>
                  </div>
                </div>
                <div className="homepage-feature-card">
                  <span>◆</span>
                  <div>
                    <p className="homepage-feature-title">Communities Get Access</p>
                    <p className="homepage-feature-copy">Real resources. Real opportunities. Real connections. The rooms they were never invited into — now open.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="homepage-category-grid">
              <div className="homepage-category-card">
                <div className="homepage-category-card-icon">⚖️</div>
                <div>
                  <p className="homepage-category-title">Legal</p>
                  <p className="homepage-category-copy">Criminal defense, expungement, civil rights, business law</p>
                </div>
              </div>
              <div className="homepage-category-card">
                <div className="homepage-category-card-icon">🎬</div>
                <div>
                  <p className="homepage-category-title">Media & Film</p>
                  <p className="homepage-category-copy">Production, content creation, storytelling, documentation</p>
                </div>
              </div>
              <div className="homepage-category-card">
                <div className="homepage-category-card-icon">💰</div>
                <div>
                  <p className="homepage-category-title">Finance & Business</p>
                  <p className="homepage-category-copy">Credit, wealth building, business formation, investment</p>
                </div>
              </div>
              <div className="homepage-category-card">
                <div className="homepage-category-card-icon">🔧</div>
                <div>
                  <p className="homepage-category-title">Trades & Skills</p>
                  <p className="homepage-category-copy">Welders, electricians, truckers, barbers — real knowledge from real work</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-section homepage-section--dark">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">Featured Voices</p>
              <h2 className="homepage-section-title">Selected. Verified. For real.</h2>
            </div>
            <Link href="/voices" className="gold-link homepage-section-cta">
              See All Voices →
            </Link>
          </div>
          <div className="homepage-voice-grid">
            <div className="homepage-voice-card">
              <div className="homepage-voice-avatar">⚖️</div>
              <h3>Legal Strategy</h3>
              <p className="homepage-feature-copy">Verified counsel, rights guides, expungement coaching, and real legal game for the people.</p>
            </div>
            <div className="homepage-voice-card">
              <div className="homepage-voice-avatar">🎬</div>
              <h3>Media & Storytelling</h3>
              <p className="homepage-feature-copy">Documentaries, backstage access, and culture-shaping media built with community trust.</p>
            </div>
            <div className="homepage-voice-card">
              <div className="homepage-voice-avatar">💼</div>
              <h3>Finance & Opportunities</h3>
              <p className="homepage-feature-copy">Funding pathways, business know-how, and the opportunity rooms that move communities forward.</p>
            </div>
          </div>
        </section>

        <section className="homepage-section">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">Latest Posts & Media</p>
              <h2 className="homepage-section-title">What professionals are sharing now.</h2>
            </div>
            <Link href="/posts/create" className="gold-link homepage-section-cta">
              Create Post →
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="page-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {recentPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body}
                  post_type={post.post_type}
                  author_name={post.author?.full_name || post.author?.username || "Anonymous"}
                  author_id={post.author_id}
                  created_at={post.created_at}
                  media_url={post.media_url}
                  image_url={post.image_url}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1rem" }}>
              <p className="muted">Posts coming soon. Verified professionals are preparing real knowledge daily.</p>
            </div>
          )}
        </section>

        <section className="homepage-section">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">Real Knowledge</p>
              <h2 className="homepage-section-title">What they never<br />taught you.</h2>
            </div>
            <div className="homepage-section-copy">
              <p className="homepage-section-text">
                From lawyers to CEOs, barbers to directors, welders to venue managers — real people sharing real knowledge. The stuff you don't learn until it's too late. Updated daily.
              </p>
            </div>
          </div>
          <div className="homepage-grid-3">
            {realKnowledgeItems.map((item) => (
              <div key={item.title} className="homepage-feature-card">
                <span>{item.icon}</span>
                <div>
                  <p className="homepage-feature-title">{item.title}</p>
                  <p className="homepage-feature-copy">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="homepage-section homepage-section--dark">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">Opportunities</p>
              <h2 className="homepage-section-title">Your next move is right here.</h2>
            </div>
            <Link href="/opportunities" className="gold-link homepage-section-cta">
              See Opportunities →
            </Link>
          </div>
          <div className="homepage-grid-3">
            {opportunityItems.map((item) => (
              <div key={item.title} className="homepage-feature-card">
                <span>{item.icon}</span>
                <div>
                  <p className="homepage-feature-title">{item.title}</p>
                  <p className="homepage-feature-copy">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="homepage-section homepage-access-section">
          <div className="homepage-section-grid homepage-section-grid--split">
            <div>
              <p className="homepage-kicker">Inside Access</p>
              <h2 className="homepage-section-title">The rooms you don’t usually see.</h2>
              <p className="homepage-section-text">
                Curated access to trusted spaces, verified rooms, and knowledge-based gatherings shaped for community stewards.
              </p>
            </div>
            <div className="homepage-access-grid">
              <div className="homepage-access-card">
                <div className="homepage-access-thumb">🎬</div>
                <div className="homepage-access-body">
                  <p className="homepage-kicker">Verified Media</p>
                  <h3>Production rooms and story access</h3>
                  <p className="homepage-feature-copy">Join verified storytelling rooms where creators, professionals, and stewards collaborate on projects.</p>
                </div>
              </div>
              <div className="homepage-access-card">
                <div className="homepage-access-thumb">🛡️</div>
                <div className="homepage-access-body">
                  <p className="homepage-kicker">Trusted Support</p>
                  <h3>Legal and financial guidance</h3>
                  <p className="homepage-feature-copy">A trusted network of advisors, attorneys, and stewards delivering practical community-first guidance.</p>
                </div>
              </div>
              <div className="homepage-access-card">
                <div className="homepage-access-thumb">🚪</div>
                <div className="homepage-access-body">
                  <p className="homepage-kicker">Opportunity Rooms</p>
                  <h3>Curated entry to the right spaces</h3>
                  <p className="homepage-feature-copy">Priority access to rooms, collaborations, and opportunities designed for people already building forward.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="homepage-section homepage-section--dark">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">Member Spotlights</p>
              <h2 className="homepage-section-title">Featured This Week</h2>
            </div>
            <Link href="/directory" className="gold-link homepage-section-cta">
              Full Directory →
            </Link>
          </div>
          <div className="homepage-grid-3">
            {spotlightItems.map((item) => (
              <div key={item.title} className="homepage-spotlight-card">
                <p className="homepage-feature-title">{item.title}</p>
                <p className="homepage-feature-copy">{item.tag}</p>
                <p className="homepage-feature-copy">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="homepage-section">
          <div className="homepage-section-header">
            <div>
              <p className="homepage-kicker">What's Happening</p>
              <h2 className="homepage-section-title">In the Collective</h2>
            </div>
            <Link href="/apply" className="gold-link homepage-section-cta">
              See All →
            </Link>
          </div>
          <div className="homepage-grid-3">
            {happeningsItems.map((item) => (
              <div key={item.title} className="homepage-event-card">
                <div className="homepage-event-icon">{item.icon}</div>
                <p className="homepage-feature-title">{item.title}</p>
                <p className="homepage-feature-copy">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="homepage-section homepage-support-section homepage-section--dark">
          <div className="homepage-support-panel">
            <div>
              <p className="homepage-kicker">Support The Collective</p>
              <h2 className="homepage-section-title">Keep trusted knowledge free.</h2>
              <p className="homepage-section-text">
                Support the platform with donations, partnerships, or by sharing verified opportunities. Your support helps keep community-first resources available to everyone.
              </p>
            </div>
            <div className="homepage-support-actions">
              <Link href="/get-access" className="gold-btn">
                Get Access
              </Link>
              <a href="mailto:hello@communitycollective.org" className="gold-link">
                Contact Support
              </a>
            </div>
          </div>
        </section>

        <section className="homepage-join-cta">
          <div className="homepage-join-cta-inner">
            <div>
              <p className="homepage-kicker">You Belong Here</p>
              <h2 className="homepage-section-title">Real people.<br />Real game.<br />Real access.</h2>
              <p className="homepage-section-text">
                Whether you're a professional with game to share, a business that deserves visibility, a creative looking for opportunities, or a community member who just needs real resources — The Collective is built for you. All of you.
              </p>
            </div>
            <div className="homepage-join-actions">
              <Link href="/get-access" className="gold-btn">
                Get Access Now
              </Link>
              <Link href="/voices" className="gold-link">
                Meet the Voices
              </Link>
            </div>
          </div>
        </section>

        <footer className="homepage-footer">
          <div className="footer-brand">
            <p className="footer-tag">Community Collective</p>
            <h2>Premium access for creators, professionals, and community stewards.</h2>
            <p className="footer-description">
              Build your profile, connect with verified professionals, and stay in the loop with opportunities designed for trusted collaborators.
            </p>
          </div>
          <div className="footer-grid">
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><Link href="/directory">Directory</Link></li>
                <li><Link href="/opportunities">Opportunities</Link></li>
                <li><Link href="/voices">Voices</Link></li>
                <li><Link href="/apply">Apply</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Member access</h3>
              <ul>
                <li><Link href="/signup">Join</Link></li>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/get-access">Get Access</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact & Help</h3>
              <p>Questions, partnerships, or support?</p>
              <p>
                <a href="mailto:hello@communitycollective.org">hello@communitycollective.org</a>
              </p>
              <p className="footer-note">For website support or directory listing help, message our team anytime.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>Explore the platform with confidence. Admin access is protected and available for approved staff only.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
