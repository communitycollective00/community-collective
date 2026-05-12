import Link from "next/link";
import AuthNavbar from "../components/auth-navbar";

export default function OnboardingPage() {
  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <h1>Welcome to Community Collective</h1>
        <p className="muted">Your account is active. Complete your profile to stand out, then head to your dashboard.</p>
        <div className="quick-links">
          <Link className="gold-btn" href="/profile/edit">Complete Profile</Link>
          <Link className="gold-btn" href="/dashboard">Go to Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
