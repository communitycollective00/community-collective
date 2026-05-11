import "./globals.css";

export const metadata = {
  title: "The Community Collective",
  description: "Real Access. Real Knowledge. Real Opportunity."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
