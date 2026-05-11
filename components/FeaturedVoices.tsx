const voices = [
  { emoji: "⚖️", name: "Monique Carter", role: "Criminal Defense Attorney", quote: "Understand your rights before you need them." },
  { emoji: "💼", name: "Avery Jordan", role: "Talent Manager", quote: "Your consistency is your strongest brand asset." },
  { emoji: "🏗️", name: "Darius Ellis", role: "Construction Director", quote: "Master one trade deeply, then scale your value." },
];

export default function FeaturedVoices() {
  return (
    <section id="voices" className="cc-section">
      <div className="cc-wrap">
        <div className="cc-section-head">
          <div>
            <p className="cc-kicker">Verified Experts</p>
            <h2 className="cc-h2">Featured Voices</h2>
          </div>
        </div>
        <div className="cc-grid cc-grid-3">
          {voices.map((voice) => (
            <article key={voice.name} className="cc-card cc-voice-card">
              <div className="cc-avatar">{voice.emoji}</div>
              <h3>{voice.name}</h3>
              <p className="cc-muted">{voice.role}</p>
              <p className="cc-quote">“{voice.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
