"use client";

import React from "react";

export default function HomePage() {
  // Keep the top padding so the sticky nav doesn't overlap the iframe content.
  // The iframe height is the viewport minus the nav height (72px) so the
  // original static page can scroll independently.
  return (
    <main style={{ paddingTop: "72px" }}>
      <iframe
        src="/original.html"
        title="Community Collective Original Homepage"
        style={{ width: "100%", height: "calc(100vh - 72px)", border: 0, display: "block" }}
        scrolling="auto"
      />
    </main>
  );
}
