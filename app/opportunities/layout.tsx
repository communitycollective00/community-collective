import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Jobs, internships, mentorship, grants, and openings that come from trusted relationships and real community access — not anonymous listings.",
  openGraph: {
    title: "Opportunities · Culture Collective",
    description:
      "Jobs, internships, mentorship, grants, and openings that come from trusted relationships and real community access.",
  },
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}