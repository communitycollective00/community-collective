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
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <div className="homepage-frame">
        <iframe
          ref={iframeRef}
          src="/original.html"
          title="Community Collective Homepage"
          className="homepage-iframe"
          onLoad={handleLoad}
        />
      </div>
    </main>
  );
}
