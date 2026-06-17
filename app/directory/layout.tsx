import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "A verified network of people doing meaningful work — creators, organizers, mentors, and builders across the culture.",
  openGraph: {
    title: "Directory · Culture Collective",
    description:
      "A verified network of people doing meaningful work — creators, organizers, mentors, and builders across the culture.",
  },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}