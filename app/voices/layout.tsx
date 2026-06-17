import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voices",
  description:
    "Real conversations with the people shaping culture — interviews, documentary reporting, and trusted firsthand knowledge from communities on the move.",
  openGraph: {
    title: "Voices · Culture Collective",
    description:
      "Real conversations with the people shaping culture — interviews, documentary reporting, and trusted firsthand knowledge.",
  },
};

export default function VoicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}