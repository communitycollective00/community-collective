"use client";
import { useEffect, useRef } from "react";
import { startLightGrid } from "../../lib/light-grid-engine";
import { LIGHT_GRID_WORDS, LIGHT_GRID_NAMES, LIGHT_GRID_INTROS, LIGHT_GRID_INTRO_MODE } from "../../lib/light-grid-content";

// Picks tonight's opening line: the first one every time, or the next one in the list on each visit.
function pickIntro(): string {
  const lines = LIGHT_GRID_INTROS.filter(Boolean);
  if (!lines.length) return "";
  if (LIGHT_GRID_INTRO_MODE !== "rotate") return lines[0];
  try {
    const next = (parseInt(localStorage.getItem("cc-intro-i") || "-1", 10) + 1) % lines.length;
    localStorage.setItem("cc-intro-i", String(next));
    return lines[next];
  } catch {
    return lines[Math.floor(Math.random() * lines.length)];
  }
}

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
  ".cc-onnow-head",
  ".cc-onnow-row",
].join(",");

// Dims the hero copy during the opening shot and keeps text readable over the light. Hero layout lives in app/home-hero.css.
const STYLES = `
.cc-light-veil{position:fixed!important;inset:0;z-index:0!important;pointer-events:none;background:radial-gradient(ellipse 62% 55% at 50% 46%,rgba(7,6,5,.55) 0%,rgba(7,6,5,.3) 50%,rgba(7,6,5,.06) 100%)}
.cc-light-grid{position:fixed!important;inset:0;width:100%;height:100%;z-index:0!important;pointer-events:none;display:block;mix-blend-mode:screen}
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
        intro: false,
        avoid: AVOID,
        introSelector: ".homepage-hero-copy",
      });
    };
    // subliminal message: the headline glitches like a bad TV signal and the line flashes in its place
    const timers: number[] = [];
    const title = document.querySelector(".homepage-hero-title") as HTMLElement | null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sub: HTMLSpanElement | null = null;
    if (title && !reduced) {
      sub = document.createElement("span");
      sub.className = "cc-sub";
      sub.setAttribute("aria-hidden", "true");
      title.appendChild(sub);
      let line = pickIntro();
      const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
      const cycle = () => {
        if (cancelled || !sub) return;
        sub.textContent = line;
        title.classList.add("cc-glitch");
        later(420, () => { title.classList.remove("cc-glitch"); title.classList.add("cc-sub-on"); });
        later(2320, () => { title.classList.remove("cc-sub-on"); title.classList.add("cc-glitch"); });
        later(2700, () => { title.classList.remove("cc-glitch"); line = pickIntro(); });
        later(2700 + 14000 + Math.random() * 8000, cycle);
      };
      later(1400, cycle);
    }

    // wait for fonts so names are measured in the right typeface
    const fonts = (document as any).fonts;
    if (fonts && fonts.ready) fonts.ready.then(go, go);
    else go();
    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
      if (title) title.classList.remove("cc-glitch", "cc-sub-on");
      if (sub) sub.remove();
      if (stop) stop();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="cc-light-veil" aria-hidden="true" />
      <canvas ref={ref} className="cc-light-grid" aria-hidden="true" />
    </>
  );
}
