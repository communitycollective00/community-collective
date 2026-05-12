import Link from "next/link";

export default function SignupCheckEmailPage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email;

  return (
    <main className="premium-page">
      <section className="premium-card">
        <h1>Check your email</h1>
        <p className="muted">We sent a confirmation link to {email ? <strong>{email}</strong> : "your inbox"}.</p>
        <p className="muted">Please open that message and click the link to finish creating your account.</p>
        <div className="quick-links">
          <Link className="gold-btn" href="/login">Back to login</Link>
          <Link className="gold-link" href="/signup">Use a different email</Link>
        </div>
      </section>
    </main>
  );
}
