"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

type SubmissionForm = {
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  industry: string;
  city: string;
  submission_type: string;
  description: string;
};

const initialForm: SubmissionForm = {
  full_name: "",
  email: "",
  phone: "",
  business_name: "",
  industry: "",
  city: "",
  submission_type: "General",
  description: "",
};

export default function GetAccessPage() {
  const [form, setForm] = useState<SubmissionForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id ?? null;

      const { error: insertError } = await (supabase.from("submissions") as any).insert({
        ...form,
        created_at: new Date().toISOString(),
        user_id: userId,
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess("Success — your request was submitted.");
      setForm(initialForm);
    } catch (submitError: any) {
      setError(submitError?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <h1 style={{ margin: 0 }}>Get Access</h1>
          <Link className="gold-link" href="/admin/submissions">Submissions Dashboard</Link>
        </div>
        <p className="muted">Join the Community Collective waitlist.</p>

        <form className="premium-form" onSubmit={onSubmit}>
          <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Business name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          <input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <select value={form.submission_type} onChange={(e) => setForm({ ...form, submission_type: e.target.value })}>
            <option>General</option>
            <option>Partnership</option>
            <option>Mentorship</option>
            <option>Membership</option>
          </select>
          <textarea placeholder="Tell us more" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />

          <button className="gold-btn" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>

          {success ? <p className="status-success">{success}</p> : null}
          {error ? <p className="status-error">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
