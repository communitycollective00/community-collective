"use client";

import { useRef } from "react";

export default function HomePage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "hideInternalNav" },
      window.location.origin
    );
  };

  return (
    <main className="premium-page homepage-main" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <div className="homepage-content">
        <div className="homepage-frame">
          <iframe
            ref={iframeRef}
            src="/original.html"
            title="Community Collective Homepage"
            className="homepage-iframe"
            onLoad={handleLoad}
          />
        </div>

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
                <li><a href="/directory">Directory</a></li>
                <li><a href="/opportunities">Opportunities</a></li>
                <li><a href="/voices">Voices</a></li>
                <li><a href="/apply">Apply</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Member access</h3>
              <ul>
                <li><a href="/signup">Join</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/get-access">Get Access</a></li>
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
