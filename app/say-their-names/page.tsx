"use client";
import { useEffect, useRef } from "react";
import { startLightGrid } from "../../lib/light-grid-engine";
import { LIGHT_GRID_NAMES } from "../../lib/light-grid-content";

export default function SayTheirNamesPage() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      stop = startLightGrid(canvas, {
        words: [],
        names: LIGHT_GRID_NAMES,
        intro: false,
        calm: true,
        avoid: ".premium-nav,.mobile-bottom-nav,.cc-ticker-outer,.cc-mem-head,.cc-mem-list",
      });
    };
    const fonts = (document as any).fonts;
    if (fonts && fonts.ready) fonts.ready.then(go, go);
    else go();
    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }, []);

  return (
    <main className="premium-page" style={{ paddingTop: 92, position: "relative", minHeight: "100vh", background: "#050404" }}>
      <canvas ref={ref} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "48px clamp(16px, 4vw, 48px) 96px" }}>
        <div className="cc-mem-head" style={{ maxWidth: 640, marginBottom: 40 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, color: "#F4CF70" }}>IN MEMORY</p>
          <h1 style={{ margin: "8px 0 12px", fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif", fontWeight: 400, fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 0.92, color: "#F6EFE3" }}>Say their names.</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, fontSize: 16 }}>
            We document the culture, including the lives it lost to police and racist violence, and the deaths that still have no answers. This list is not complete.
          </p>
        </div>
        <ul className="cc-mem-list" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
          {LIGHT_GRID_NAMES.map((n) => (
            <li key={n.name} style={{ padding: 18, borderRadius: 14, background: "rgba(16,13,10,0.86)", border: "1px solid rgba(246,239,227,0.1)", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-display, 'Bebas Neue'), sans-serif", fontSize: 30, lineHeight: 1, color: "#F6EFE3" }}>{n.name}</span>
              <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, letterSpacing: "0.06em", color: "#E9B949" }}>
                {[n.age ? `AGE ${n.age}` : "", (n.place || "").toUpperCase(), n.year].filter(Boolean).join("  ·  ")}
              </span>
              {n.how && <span style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>{n.how}</span>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
