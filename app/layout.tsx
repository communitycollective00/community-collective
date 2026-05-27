import "./globals.css";
import { AuthProvider } from "./components/auth-provider";
import RootNavBar from "./components/root-navbar";

export const metadata = {
  title: "Community Collective",
  description: "Media + Opportunity + Access Platform",
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
      </body>
    </html>
  );
}
