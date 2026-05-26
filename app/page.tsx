"use client";

import { useEffect, useRef } from "react";
import AuthNavbar from "./components/auth-navbar";
import { useAuth } from "./components/auth-provider";

export default function HomePage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { user, profile, role, loading, error } = useAuth();

  useEffect(() => {
    // When iframe loads, hide its internal nav so we use the React navbar instead
    function sendHide() {
      try {
        iframeRef.current?.contentWindow?.postMessage({ type: "hideInternalNav" }, window.location.origin);
      } catch (e) {
        // allow cross-origin failures silently in other environments
      }
    }

    // initial hide and whenever auth state changes, inform iframe
    sendHide();
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: "auth:update", user, profile, role, loading, error }, window.location.origin);
    } catch (e) {}
  }, [user, profile, role, loading, error]);

  return (
    <main style={{ minHeight: '100vh', background: '#080808' }}>
      <AuthNavbar />
      <div style={{ marginTop: '72px' }}>
        <iframe
          ref={iframeRef}
          src="/original.html"
          title="Community Collective Homepage"
          style={{ width: '100%', height: 'calc(100vh - 72px)', border: 'none', display: 'block' }}
        />
      </div>
    </main>
  );
}
