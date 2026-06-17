import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "./components/auth-provider";
import RootNavBar from "./components/root-navbar";

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
        <AuthProvider>
          <RootNavBar />
          {children}
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