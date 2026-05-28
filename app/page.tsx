"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="premium-page homepage-main" style={{ paddingTop: "72px" }}>
      <div className="homepage-content">
        <section className="homepage-hero">
          <div className="homepage-hero-copy">
            <p className="homepage-kicker">Now Accepting Founding Members — National</p>
            <h1 className="homepage-hero-title">
              REAL <span className="homepage-highlight">PEOPLE.</span>
              <br />
              REAL <span className="homepage-highlight homepage-highlight--green">KNOWLEDGE.</span>
              <br />
              REAL <span className="homepage-highlight">ACCESS.</span>
            </h1>
            <p className="homepage-hero-text">
              A trusted ecosystem where top lawyers post free legal game, professionals from every walk of life share real knowledge daily, and communities finally get access to the people, rooms, and opportunities that were always there — just never for them.
            </p>
            <div className="homepage-hero-actions">
              <Link href="/directory" className="gold-btn">
                Explore Directory
              </Link>
              <Link href="/get-access" className="gold-link">
                Get Access
              </Link>
            </div>
          </div>

          <div className="homepage-hero-stats">
            <div className="homepage-stat-card">
              <div className="homepage-stat-number">300+</div>
              <p>Records Cleared</p>
            </div>
            <div className="homepage-stat-card">
              <div className="homepage-stat-number">40+</div>
              <p>Brands Served</p>
            </div>
            <div className="homepage-stat-card">
              <div className="homepage-stat-number">Free</div>
              <p>To Join</p>
            </div>
          </div>
        </section>

        <section className="homepage-section">
          <div className="homepage-section-grid">
            <div>
              <p className="homepage-kicker">What This Is</p>
              <h2 className="homepage-section-title">Not just a platform. An ecosystem.</h2>
              <p className="homepage-section-text">
                This is a trust-based access network powered by real people and real media. Not content-first. Not social-first. Access-first. Everything else — media, opportunities, profiles — is evidence of that access.
              </p>
            </div>
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
        </section>

        <section className="homepage-section homepage-section--dark">
          <div className="homepage-section-grid homepage-section-grid--split">
            <div>
              <p className="homepage-kicker">The trusted network</p>
              <h2 className="homepage-section-title">Built for creators, professionals, and stewards.</h2>
              <p className="homepage-section-text">
                Showcase your profile, discover verified professionals, and stay current with opportunities that move communities forward. This page is now one continuous flow — no nested scrolling, no iframe wrappers, no separate scroll containers.
              </p>
            </div>
            <div className="homepage-feature-list">
              <div className="homepage-feature-card">
                <span>⚖️</span>
                <div>
                  <p className="homepage-feature-title">Legal Game</p>
                  <p className="homepage-feature-copy">Free legal knowledge from attorneys and community stewards so people can protect themselves and their families.</p>
                </div>
              </div>
              <div className="homepage-feature-card">
                <span>🎬</span>
                <div>
                  <p className="homepage-feature-title">Media & Film</p>
                  <p className="homepage-feature-copy">Access backstage content, interviews, and documentary moments created with the community in mind.</p>
                </div>
              </div>
              <div className="homepage-feature-card">
                <span>💰</span>
                <div>
                  <p className="homepage-feature-title">Finance & Business</p>
                  <p className="homepage-feature-copy">Expert guidance on business, credit, and opportunity navigation from trusted professionals.</p>
                </div>
              </div>
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
