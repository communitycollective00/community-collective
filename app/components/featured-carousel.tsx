"use client";

import { useRef, useState } from "react";
import VideoEmbed from "./video-embed";

type Item = {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
};

export default function FeaturedCarousel({ items, title }: { items: Item[]; title?: string | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (!items || items.length === 0) return null;

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="homepage-featured-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {items.map((it) => (
          <div key={it.id} style={{ flex: "0 0 100%", minWidth: "100%", scrollSnapAlign: "start" }}>
            {it.media_type === "image" ? (
              <img src={it.media_url} alt={it.caption || ""} style={{ width: "100%", height: 240, objectFit: "cover", display: "block", background: "#000" }} />
            ) : (
              <VideoEmbed url={it.media_url} height={240} rounded={false} />
            )}
            {it.caption && (
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5, padding: "0.6rem 0.9rem 0" }}>{it.caption}</p>
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "0.85rem 0 0.6rem" }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to item ${i + 1}`}
              style={{
                width: i === active ? 22 : 7,
                height: 7,
                borderRadius: 4,
                border: 0,
                padding: 0,
                cursor: "pointer",
                background: i === active ? "#c9a84c" : "rgba(255,255,255,0.3)",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      )}

      {title && (
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(201,168,76,0.7)", padding: "0 0.9rem 0.9rem", margin: 0 }}>{title}</p>
      )}
    </div>
  );
}
