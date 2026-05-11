export default function Hero() {
  return (
    <header className="cc-hero" id="top">
      <div className="cc-hero-bg" />
      <div className="cc-hero-grid" />
      <div className="cc-hero-glow" />

      <div className="cc-wrap cc-hero-content">
        <p className="cc-kicker">The Community Collective</p>
        <h1 className="cc-hero-title">
          ELEVATE <span className="gold">YOUR VOICE</span>
          <br />
          ACCESS <span className="green">REAL OPPORTUNITY</span>
        </h1>
        <p className="cc-sub">
          A premium network where trusted professionals, creators, and culture leaders share insight,
          opportunities, and direct pathways to growth.
        </p>
        <div className="cc-hero-actions">
          <button className="cc-btn cc-btn-gold">Explore Platform</button>
          <button className="cc-btn cc-btn-ghost">See Latest Voices</button>
        </div>
      </div>
    </header>
  );
}
