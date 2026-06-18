import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "./components/auth-provider";
import RootNavBar from "./components/root-navbar";
import Link from "next/link";
import { BgPrefetch } from "./components/bg-prefetch";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://community-collective-xi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Culture Collective — Real People. Real Knowledge. Real Access.",
    template: "%s · Culture Collective",
  },
  description:
    "A living archive of people doing meaningful work — storytelling, organizing, mentoring, and trusted access from communities on the move.",
  keywords: [
    "community platform",
    "culture",
    "documentary",
    "opportunities",
    "mentorship",
    "citizen journalism",
    "Chicago",
    "Indianapolis",
  ],
  authors: [{ name: "Culture Collective" }],
  manifest: "/manifest.json",
  applicationName: "Culture Collective",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Culture Collective",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: "Culture Collective",
    title: "Culture Collective — Real People. Real Knowledge. Real Access.",
    description:
      "A living archive of people doing meaningful work — storytelling, organizing, mentoring, and trusted access from communities on the move.",
    url: SITE_URL,
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Culture Collective",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Culture Collective — Real People. Real Knowledge. Real Access.",
    description:
      "A living archive of people doing meaningful work — storytelling, organizing, mentoring, and trusted access from communities on the move.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#C9A84C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){if(typeof IntersectionObserver==="undefined")return;var o=new IntersectionObserver(function(e){e.forEach(function(n){if(n.isIntersecting)n.target.classList.add("cc-visible")})},{threshold:0.08,rootMargin:"0px 0px -40px 0px"});function i(){document.querySelectorAll(".fade-up:not([data-ob])").forEach(function(el){el.setAttribute("data-ob","1");o.observe(el)})}document.addEventListener("DOMContentLoaded",i);setTimeout(i,600);setTimeout(i,1800)})();` }} />
        <AuthProvider>
          <BgPrefetch />
          <RootNavBar />
        <div className="cc-ticker-outer" aria-hidden="true"><div className="cc-ticker-track"><span className="cc-ticker-item">Interviews</span><span className="cc-ticker-item">Opportunities</span><span className="cc-ticker-item">Chicago</span><span className="cc-ticker-item">Indianapolis</span><span className="cc-ticker-item">Culture</span><span className="cc-ticker-item">Community</span><span className="cc-ticker-item">Press</span><span className="cc-ticker-item">Access</span><span className="cc-ticker-item">Network</span><span className="cc-ticker-item">Stories</span><span className="cc-ticker-item">Events</span><span className="cc-ticker-item">Directory</span><span className="cc-ticker-item">Interviews</span><span className="cc-ticker-item">Opportunities</span><span className="cc-ticker-item">Chicago</span><span className="cc-ticker-item">Indianapolis</span><span className="cc-ticker-item">Culture</span><span className="cc-ticker-item">Community</span><span className="cc-ticker-item">Press</span><span className="cc-ticker-item">Access</span><span className="cc-ticker-item">Network</span><span className="cc-ticker-item">Stories</span><span className="cc-ticker-item">Events</span><span className="cc-ticker-item">Directory</span></div></div>
          {children}
          <footer style={{ borderTop: "1px solid rgba(201,168,76,0.08)", padding: "2rem 1.5rem 5.5rem", display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/press" style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)", textDecoration: "none" }}>Press</Link>
            <Link href="/get-access" style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>Join</Link>
            <Link href="/opportunities" style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>Opportunities</Link>
            <Link href="/voices" style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>Voices</Link>
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>&#169; 2026 Culture Collective</span>
          </footer>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function () {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}