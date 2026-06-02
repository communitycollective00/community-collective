"use client";

import Link from "next/link";
import { homepageContent } from "./homepage-content";

export default function HomePage() {
  const {
    hero,
    featureCards,
    categoryCards,
    voiceCards,
    knowledgeCards,
    opportunityCards,
    accessCards,
    spotlightCards,
    eventCards,
    sectionBackgrounds,
  } = homepageContent;

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
              <p>{hero.bannerText}</p>
            </div>
            <h1 className="homepage-hero-title">
              {hero.headline.map((segment, index) => (
                <span key={index}>
                  <span
                    className={`homepage-highlight${segment.highlight ? ` homepage-highlight--${segment.highlight}` : ""}`}
                  >
                    {segment.text}
                  </span>
                  {index < hero.headline.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="homepage-hero-text">{hero.description}</p>
            <div className="homepage-hero-actions">
              {hero.actions.map((action) =>
                action.variant === "button" ? (
                  <Link key={action.label} href={action.href} className="gold-btn">
                    {action.label}
                  </Link>
                ) : (
                  <Link key={action.label} href={action.href} className="gold-link">
                    {action.label}
                  </Link>
                )
              )}
            </div>
            <div className="homepage-hero-pill">
              <span className="homepage-hero-pill-number">{hero.pill.label}</span>
              <span className="homepage-hero-pill-label">{hero.pill.labelSecondary}</span>
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
                {featureCards.map((card) => (
                  <div key={card.title} className="homepage-feature-card">
                    <span>{card.icon}</span>
                    <div>
                      <p className="homepage-feature-title">{card.title}</p>
                      <p className="homepage-feature-copy">{card.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="homepage-category-grid">
              {categoryCards.map((category) => (
                <div key={category.title} className="homepage-category-card">
                  <div className="homepage-category-card-icon">{category.icon}</div>
                  <div>
                    <p className="homepage-category-title">{category.title}</p>
                    <p className="homepage-category-copy">{category.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="homepage-section homepage-section--dark"
          style={sectionBackgrounds.featuredVoices ? { background: sectionBackgrounds.featuredVoices } : undefined}
        >
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
            {voiceCards.map((voice) => (
              <div key={`${voice.role}-${voice.title}`} className="homepage-voice-card">
                <img src={voice.image} alt={`${voice.title} ${voice.role}`} className="homepage-card-image" />
                <div className="homepage-voice-avatar">🔊</div>
                <h3>{voice.role}</h3>
                <p className="homepage-feature-copy">{voice.summary}</p>
              </div>
            ))}
          </div>
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
            {knowledgeCards.map((item) => (
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

        <section
          className="homepage-section homepage-section--dark"
          style={sectionBackgrounds.opportunities ? { background: sectionBackgrounds.opportunities } : undefined}
        >
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
            {opportunityCards.map((item) => (
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
              {accessCards.map((item) => (
                <div key={item.title} className="homepage-access-card">
                  <div className="homepage-access-thumb">{item.icon}</div>
                  <div className="homepage-access-body">
                    <p className="homepage-kicker">{item.kicker}</p>
                    <h3>{item.title}</h3>
                    <p className="homepage-feature-copy">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="homepage-section" style={sectionBackgrounds.spotlight ? { background: sectionBackgrounds.spotlight } : undefined}>
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
            {spotlightCards.map((item) => (
              <div key={item.title} className="homepage-spotlight-card">
                <p className="homepage-feature-title">{item.title}</p>
                <p className="homepage-feature-copy">{item.tag}</p>
                <p className="homepage-feature-copy">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="homepage-section" style={sectionBackgrounds.events ? { background: sectionBackgrounds.events } : undefined}>
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
            {eventCards.map((item) => (
              <div key={`${item.title}-${item.icon}-${item.copy}`} className="homepage-event-card">
                <div className="homepage-event-icon">{item.icon}</div>
                <p className="homepage-feature-title">{item.title}</p>
                <p className="homepage-feature-copy">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="homepage-section homepage-support-section homepage-section--dark" style={sectionBackgrounds.support ? { background: sectionBackgrounds.support } : undefined}>
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
