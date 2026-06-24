"use client";

import { useEffect, useRef } from "react";

type Props = {
  url: string;
  height?: number;
  rounded?: boolean;
};

function ytId(url: string): string | null {
  if (url.includes("watch?v=")) return url.split("watch?v=")[1]?.split("&")[0] || null;
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0] || null;
  if (url.includes("youtube.com/embed/")) return url.split("embed/")[1]?.split("?")[0] || null;
  if (url.includes("youtube.com/shorts/")) return url.split("shorts/")[1]?.split("?")[0] || null;
  return null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function isInstagram(url: string) {
  return url.includes("instagram.com/p/") || url.includes("instagram.com/reel/") || url.includes("instagram.com/tv/");
}

function isTikTok(url: string) {
  return url.includes("tiktok.com/") && url.includes("/video/");
}

function isMp4(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export default function VideoEmbed({ url, height = 320, rounded = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const radius = rounded ? 16 : 0;

  const yt = url ? ytId(url) : null;
  const vimeo = url ? vimeoId(url) : null;
  const ig = url ? isInstagram(url) : false;
  const tt = url ? isTikTok(url) : false;
  const mp4 = url ? isMp4(url) : false;

  // Load + process embed scripts for IG / TikTok after mount
  useEffect(() => {
    if (ig) {
      const existing = document.querySelector('script[src="//www.instagram.com/embed.js"]');
      if (existing) {
        (window as any).instgrm?.Embeds?.process();
      } else {
        const s = document.createElement("script");
        s.src = "//www.instagram.com/embed.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }
    if (tt) {
      const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (existing) {
        existing.remove();
      }
      const s = document.createElement("script");
      s.src = "https://www.tiktok.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, [url, ig, tt]);

  if (!url) return null;

  const wrapStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: radius,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: "1rem",
  };

  // YouTube — inline iframe player
  if (yt) {
    return (
      <div style={{ ...wrapStyle, height }}>
        <iframe
          src={`https://www.youtube.com/embed/${yt}`}
          title="YouTube video"
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo — inline iframe player
  if (vimeo) {
    return (
      <div style={{ ...wrapStyle, height }}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}`}
          title="Vimeo video"
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct MP4 — native player
  if (mp4) {
    return (
      <div style={{ ...wrapStyle, height }}>
        <video controls preload="metadata" style={{ width: "100%", height, objectFit: "cover", display: "block", backgroundColor: "#000" }}>
          <source src={url} />
        </video>
      </div>
    );
  }

  // Instagram — official blockquote embed (processed by embed.js)
  if (ig) {
    return (
      <div ref={containerRef} style={{ ...wrapStyle, height: "auto", backgroundColor: "transparent" }}>
        <blockquote
          className="instagram-media"
          data-instgrm-captioned
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: "#000", border: 0, margin: 0, width: "100%" }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c", padding: "1rem", display: "block" }}>
            Open this Instagram video ↗
          </a>
        </blockquote>
      </div>
    );
  }

  // TikTok — official blockquote embed (processed by embed.js)
  if (tt) {
    const vid = url.split("/video/")[1]?.split("?")[0] || "";
    return (
      <div ref={containerRef} style={{ ...wrapStyle, height: "auto", backgroundColor: "transparent" }}>
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={vid}
          style={{ maxWidth: "100%", minWidth: "100%", margin: 0 }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c", padding: "1rem", display: "block" }}>
            Open this TikTok video ↗
          </a>
        </blockquote>
      </div>
    );
  }

  // Unknown source — clean fallback link, never a blank box
  return (
    <div style={{ ...wrapStyle, height: "auto", padding: "1.25rem", backgroundColor: "#0c0b08", border: "0.5px solid rgba(201,168,76,0.25)" }}>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#c9a84c", textDecoration: "none", fontSize: "0.9rem", letterSpacing: "0.02em" }}>
        Open video ↗
      </a>
    </div>
  );
}
