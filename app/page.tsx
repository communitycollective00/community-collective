"use client";

import Link from "next/link";
import { HomepageCard } from "./components/homepage-card";
import { homepageContent } from "./homepage-content";

export default function HomePage() {
  const {
    hero,
    featuredStory,
    peopleBuildingThings,
    insideAccess,
    opportunitiesToday,
    realGame,
    communityStories,
    joinMovement,
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

        <section
          className="homepage-section homepage-section--dark homepage-section--image"
          style={
            featuredStory.section.backgroundImage
              ? {
                  backgroundImage: `url(${featuredStory.section.backgroundImage})`,
                  backgroundPosition: featuredStory.section.backgroundPosition,
                }
              : undefined
          }
        >
          {featuredStory.section.backgroundImage ? (
            <div
              className="homepage-section-bg-overlay"
              style={{ opacity: featuredStory.section.overlayOpacity }}
            />
          ) : null}
          <div className="homepage-section-inner">
            <div className="homepage-section-header">
              <div>
                <p className="homepage-kicker">Featured Story</p>
                <h2 className="homepage-section-title">A local voice shaping real change.</h2>
              </div>
              <Link href="/voices" className="gold-link homepage-section-cta">
                See All Voices →
              </Link>
            </div>
            <div className="homepage-voice-grid">
              {featuredStory.cards.map((card) => (
                <HomepageCard
                  key={`${card.title}-${card.role}-${card.city}`}
                  title={card.title}
                  subtitle={card.subtitle}
                  image={card.image}
                  role={card.role}
                  city={card.city}
                  description={card.description}
                  link={card.link}
                  className="homepage-voice-card"
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="homepage-section"
          style={
            peopleBuildingThings.section.backgroundImage
              ? {
                  backgroundImage: `url(${peopleBuildingThings.section.backgroundImage})`,
                  backgroundPosition: peopleBuildingThings.section.backgroundPosition,
                }
              : undefined
          }
        >
          {peopleBuildingThings.section.backgroundImage ? (
            <div
              className="homepage-section-bg-overlay"
              style={{ opacity: peopleBuildingThings.section.overlayOpacity }}
            />
          ) : null}
          <div className="homepage-section-inner">
            <div className="homepage-section-header">
              <div>
                <p className="homepage-kicker">People Building Things</p>
                <h2 className="homepage-section-title">The communities making progress right now.</h2>
              </div>
            </div>
            <div className="homepage-feature-list">
              {peopleBuildingThings.featureCards.map((card) => (
                <HomepageCard
                  key={`${card.title}-${card.role}-${card.city}`}
                  title={card.title}
                  subtitle={card.subtitle}
                  image={card.image}
                  role={card.role}
                  city={card.city}
                  description={card.description}
                  link={card.link}
                  className="homepage-feature-card"
                />
              ))}
            </div>
            <div className="homepage-category-grid">
              {peopleBuildingThings.categoryCards.map((card) => (
                <HomepageCard
                  key={`${card.title}-${card.role}-${card.city}`}
                  title={card.title}
                  subtitle={card.subtitle}
                  image={card.image}
                  role={card.role}
                  city={card.city}
                  description={card.description}
                  link={card.link}
                  className="homepage-category-card"
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="homepage-section homepage-section--dark homepage-section--image"
          style={
            insideAccess.section.backgroundImage
              ? {
                  backgroundImage: `url(${insideAccess.section.backgroundImage})`,
                  backgroundPosition: insideAccess.section.backgroundPosition,
                }
              : undefined
          }
        >
          {insideAccess.section.backgroundImage ? (
            <div
              className="homepage-section-bg-overlay"
              style={{ opacity: insideAccess.section.overlayOpacity }}
            />
          ) : null}
          <div className="homepage-section-inner">
            <div className="homepage-section-grid homepage-section-grid--split">
              <div>
                <p className="homepage-kicker">Inside Access</p>
                <h2 className="homepage-section-title">The rooms you don’t usually see.</h2>
                <p className="homepage-section-text">
                  Curated access to trusted spaces, verified rooms, and knowledge-based gatherings shaped for community stewards.
                </p>
              </div>
              <div className="homepage-access-grid">
                {insideAccess.cards.map((card) => (
                  <HomepageCard
                    key={`${card.title}-${card.role}-${card.city}`}
                    title={card.title}
                    subtitle={card.subtitle}
                    image={card.image}
                    role={card.role}
                    city={card.city}
                    description={card.description}
                    link={card.link}
                    className="homepage-access-card"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="homepage-section homepage-section--dark homepage-section--image"
          style={
            opportunitiesToday.section.backgroundImage
              ? {
                  backgroundImage: `url(${opportunitiesToday.section.backgroundImage})`,
                  backgroundPosition: opportunitiesToday.section.backgroundPosition,
                }
              : undefined
          }
        >
          {opportunitiesToday.section.backgroundImage ? (
            <div
              className="homepage-section-bg-overlay"
              style={{ opacity: opportunitiesToday.section.overlayOpacity }}
            />
          ) : null}
          <div className="homepage-section-inner">
            <div className="homepage-section-header">
              <div>
                <p className="homepage-kicker">Opportunities Today</p>
                <h2 className="homepage-section-title">Your next move is right here.</h2>
              </div>
              <Link href="/opportunities" className="gold-link homepage-section-cta">
                See Opportunities →
              </Link>
            </div>
            <div className="homepage-grid-3">
              {opportunitiesToday.cards.map((card) => (
                <HomepageCard
                  key={`${card.title}-${card.role}-${card.city}`}
                  title={card.title}
                  subtitle={card.subtitle}
                  image={card.image}
                  role={card.role}
                  city={card.city}
                  description={card.description}
                  link={card.link}
                  className="homepage-feature-card"
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="homepage-section"
          style={
            realGame.section.backgroundImage
              ? {
                  backgroundImage: `url(${realGame.section.backgroundImage})`,
                  backgroundPosition: realGame.section.backgroundPosition,
                }
              : undefined
          }
        >
          {realGame.section.backgroundImage ? (
            <div className="homepage-section-bg-overlay" style={{ opacity: realGame.section.overlayOpacity }} />
          ) : null}
          <div className="homepage-section-inner">
            <div className="homepage-section-header">
              <div>
                <p className="homepage-kicker">Real Game</p>
                <h2 className="homepage-section-title">What they never<br />taught you.</h2>
              </div>
              <div className="homepage-section-copy">
                <p className="homepage-section-text">
                  From lawyers to CEOs, barbers to directors, welders to venue managers — real people sharing real knowledge. The stuff you don't learn until it's too late. Updated daily.
                </p>
              </div>
            </div>
            <div className="homepage-grid-3">
              {realGame.cards.map((card) => (
                <HomepageCard
                  key={`${card.title}-${card.role}-${card.city}`}
                  title={card.title}
                  subtitle={card.subtitle}
                  image={card.image}
                  role={card.role}
                  city={card.city}
                  description={card.description}
                  link={card.link}
                  className="homepage-feature-card"
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="homepage-section"
          style={
            communityStories.section.backgroundImage
              ? {
                  backgroundImage: `url(${communityStories.section.backgroundImage})`,
                  backgroundPosition: communityStories.section.backgroundPosition,
                }
              : undefined
          }
        >
          {communityStories.section.backgroundImage ? (
            <div
              className="homepage-section-bg-overlay"
              style={{ opacity: communityStories.section.overlayOpacity }}
            />
          ) : null}
          <div className="homepage-section-inner">
            <div className="homepage-section-header">
              <div>
                <p className="homepage-kicker">Community Stories</p>
                <h2 className="homepage-section-title">Featured This Week</h2>
              </div>
              <Link href="/directory" className="gold-link homepage-section-cta">
                Full Directory →
              </Link>
            </div>
            <div className="homepage-grid-3">
              {communityStories.cards.map((card) => (
                <HomepageCard
                  key={`${card.title}-${card.role}-${card.city}`}
                  title={card.title}
                  subtitle={card.subtitle}
                  image={card.image}
                  role={card.role}
                  city={card.city}
                  description={card.description}
                  link={card.link}
                  className="homepage-spotlight-card"
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="homepage-section homepage-join-cta"
          style={
            joinMovement.section.backgroundImage
              ? {
                  backgroundImage: `url(${joinMovement.section.backgroundImage})`,
                  backgroundPosition: joinMovement.section.backgroundPosition,
                }
              : undefined
          }
        >
          {joinMovement.section.backgroundImage ? (
            <div className="homepage-section-bg-overlay" style={{ opacity: joinMovement.section.overlayOpacity }} />
          ) : null}
          <div className="homepage-join-cta-inner">
            <div>
              <p className="homepage-kicker">Join The Movement</p>
              <h2 className="homepage-section-title">{joinMovement.title}</h2>
              <p className="homepage-section-text">{joinMovement.text}</p>
            </div>
            <div className="homepage-join-actions">
              {joinMovement.actions.map((action) =>
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
