export default function Navbar() {
  const links = ["Voices", "Opportunities", "Inside Access", "Directory"];

  return (
    <nav className="cc-nav">
      <div className="cc-wrap cc-nav-inner">
        <a className="cc-logo" href="#top" aria-label="The Community Collective home">
          <div className="cc-logo-mark">CC</div>
          <div>
            <div className="cc-logo-top">COMMUNITY COLLECTIVE</div>
            <div className="cc-logo-bottom">Media • Opportunity • Access</div>
          </div>
        </a>

        <div className="cc-nav-links" aria-label="Primary">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-")}`} className="cc-nav-link">
              {link}
            </a>
          ))}
        </div>

        <button className="cc-btn cc-btn-gold cc-btn-sm">Join Collective</button>
      </div>
    </nav>
  );
}
