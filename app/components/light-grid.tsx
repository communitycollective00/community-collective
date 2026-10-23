"use client";
import { useEffect, useRef } from "react";
import { startLightGrid } from "../../lib/light-grid-engine";
import { LIGHT_GRID_WORDS, LIGHT_GRID_NAMES } from "../../lib/light-grid-content";

// Page content the names and words steer around, so they never cover text, cards or buttons.
const AVOID = [
  ".premium-nav",
  ".mobile-bottom-nav",
  ".cc-ticker-outer",
  ".homepage-hero-copy",
  ".homepage-featured-slot",
  ".media-feed-section",
  ".cc-stats-strip",
  ".hp-section-head",
  ".hp-section-split-left",
  ".hp-grid-3",
  ".hp-grid-2",
  ".hp-grid-wide",
  ".hp-join-inner",
].join(",");

// Centers the hero, swaps the old hero grid for the light grid, and dims the hero copy during the opening shot.
const STYLES = `
.cc-light-grid{position:fixed!important;inset:0;width:100%;height:100%;z-index:0!important;pointer-events:none;display:block}
.homepage-hero{grid-template-columns:1fr!important;justify-items:center;text-align:center}
.homepage-hero-grid{display:none!important}
.homepage-hero-copy{display:flex;flex-direction:column;align-items:center;max-width:860px;margin-inline:auto;transition:opacity .9s ease}
.homepage-hero-ribbon{margin-inline:auto}
.homepage-hero-actions{justify-content:center!important}
.homepage-hero-text{padding-right:0!important;margin-inline:auto}
.homepage-featured-slot{width:100%;max-width:960px;margin-inline:auto}
body.cc-intro .homepage-hero-copy{opacity:.12}
.cc-stats-strip{background:rgba(10,9,7,.82)!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-color:rgba(201,168,76,.28)!important}
.cc-stat-num{text-shadow:0 0 18px rgba(244,207,112,.35)}
.cc-stat-lbl{color:rgba(255,255,255,.62)!important}
.homepage-hero-ribbon{background:rgba(10,9,7,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.homepage-hero-text{color:rgba(255,255,255,.86)!important}
.hp-section-body{color:rgba(255,255,255,.72)!important}
.homepage-hero-title,.homepage-hero-text,.hp-section-title,.hp-section-body,.hp-eyebrow,.hp-join-title,.hp-join-body{text-shadow:0 2px 18px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.6)}
`;

export default function LightGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      stop = startLightGrid(canvas, {
        words: LIGHT_GRID_WORDS,
        names: LIGHT_GRID_NAMES,
        avoid: AVOID,
        introSelector: ".homepage-hero-copy",
      });
    };
    // wait for fonts so names are measured in the right typeface
    const fonts = (document as any).fonts;
    if (fonts && fonts.ready) fonts.ready.then(go, go);
    else go();
    return () => {
      cancelled = true;
      if (stop) stop();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <canvas ref={ref} className="cc-light-grid" aria-hidden="true" />
    </>
  );
}
