"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

type ApplicationForm = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  application_type: "public_member" | "professional_organization";
  industry: string;
  reason: string;
  website_social: string;
};

const initialForm: ApplicationForm = {
  full_name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  application_type: "public_member",
  industry: "",
  reason: "",
  website_social: "",
};

const accessBenefits = [
  { title: "For real people", copy: "Find practical knowledge, trusted professionals, and community-ready resources without the gatekeeper noise." },
  { title: "For trusted professionals", copy: "Share your expertise, build reputation, and connect with the people who need your work most." },
  { title: "For local opportunity", copy: "Access curated openings, collaborations, workshops, and support rooted in real neighborhoods and real systems." },
];

const nextSteps = [
  "We review every application and approve members and professionals who align with the network.",
  "Once approved, you'll get an email with membership access and next-step instructions.",
  "Members can immediately explore the directory, opportunities, voices, and community resources.",
];

export default function GetAccessPage() {
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pageBg, setPageBg] = useState<string>("");

  useEffect(() => {
    async function loadBg() {
      try {
        const supabase = getSupabaseClient();
        // get-access page uses the "opportunities" key (labeled "Get In" in control room)
        const { data } = await (supabase.from("page_backgrounds") as any)
          .select("*").eq("page_key", "opportunities").limit(1);
        const bgRow = Array.isArray(data) ? data[0] : data;
        if (bgRow?.image_url) setPageBg(bgRow.image_url);
      } catch (e) {
        // silent — background is non-critical
      }
    }
    loadBg();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error: insertError } = await (supabase.from("applications") as any).insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        city: form.city,
        state: form.state,
        application_type: form.application_type,
        industry: form.industry,
        reason: form.reason,
        website_social: form.website_social || null,
        status: "pending",
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setForm(initialForm);
    } catch (submitError: any) {
      setError(submitError?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const bgStyle = pageBg
    ? { backgroundImage: `url(${pageBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundAttachment: "fixed" }
    : {};

  if (success) {
    return (
      <main className="premium-page" style={{ paddingTop: "92px", ...bgStyle }}>
        <section className="premium-card" style={{ maxWidth: "760px", margin: "2rem auto", padding: "2.5rem" }}>
          <p className="homepage-kicker">Application submitted</p>
          <h1 className="homepage-section-title">Your access request is in review</h1>
          <p className="homepage-section-text">
            Thanks for applying to Community Collective. We'll review your application and send next-step access details to your inbox.
          </p>
          <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
            <div className="homepage-feature-card">
              <p className="homepage-feature-title">What happens next</p>
              <p className="homepage-feature-copy">We review your application, validate your member type, and deliver your account instructions by email.</p>
            </div>
            <div className="homepage-feature-card">
              <p className="homepage-feature-title">Your first access</p>
              <p className="homepage-feature-copy">Once approved, you can immediately explore directory profiles, open opportunities, trusted voices, and community resources.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page" style={{ paddingTop: "92px", ...bgStyle }}>
      <section className="premium-card" style={{ maxWidth: "1200px", margin: "2rem auto", padding: "2.5rem" }}>
        <div className="homepage-section-grid homepage-section-grid--split" style={{ gap: "2.5rem" }}>
          <div>
            <p className="homepage-kicker">Get access</p>
            <h1 className="homepage-section-title">Join a living access network built for real people, trusted professionals, and local opportunity.</h1>
            <p className="homepage-section-text">
              Community Collective is for people who want direct entry to practical knowledge, verified services, and opportunity rooms that were never built for them. Apply now to unlock membership, trusted connections, and access to community infrastructure.
            </p>

            <div className="homepage-grid-3" style={{ gap: "1rem", marginTop: "1.5rem" }}>
              {accessBenefits.map((benefit) => (
                <div key={benefit.title} className="homepage-feature-card">
                  <p className="homepage-feature-title">{benefit.title}</p>
                  <p className="homepage-feature-copy">{benefit.copy}</p>
                </div>
              ))}
            </div>

            <div className="homepage-section homepage-section--dark" style={{ padding: "1.75rem", marginTop: "2rem", borderRadius: "18px" }}>
              <p className="homepage-kicker">Why this matters</p>
              <p className="homepage-section-text">
                Access means more than a profile: it means doors to trusted voices, opportunities, local knowledge, and the resources your community can actually use.
              </p>
              <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
                <p className="homepage-feature-copy">• Browse verified professionals and peer-led resources without the noise.</p>
                <p className="homepage-feature-copy">• Connect to real opportunities, from legal game to funding, partnerships, and creative work.</p>
                <p className="homepage-feature-copy">• Join a membership network where knowledge, documentation, and support are shared with care.</p>
              </div>
            </div>
          </div>

          <div className="page-panel" style={{ padding: "2rem", borderRadius: "24px" }}>
            <p className="homepage-kicker">Apply now</p>
            <h2 className="homepage-section-title" style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              Free membership starts with your application.
            </h2>
            <p className="homepage-section-text" style={{ marginBottom: "1.75rem" }}>
              Public members, professionals, and organizations are welcome. Complete the form below, and we'll review your application quickly.
            </p>

            <form className="premium-form" onSubmit={onSubmit}>
              <fieldset style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "1.5rem", marginBottom: "1.75rem" }}>
                <legend style={{ padding: "0 8px", color: "#C9A84C", fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em" }}>
                  APPLYING AS
                </legend>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="application_type"
                      value="public_member"
                      checked={form.application_type === "public_member"}
                      onChange={(e) => setForm({ ...form, application_type: e.target.value as any })}
                      style={{ cursor: "pointer" }}
                    />
                    <span>Public Member</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="application_type"
                      value="professional_organization"
                      checked={form.application_type === "professional_organization"}
                      onChange={(e) => setForm({ ...form, application_type: e.target.value as any })}
                      style={{ cursor: "pointer" }}
                    />
                    <span>Professional / Organization</span>
                  </label>
                </div>
              </fieldset>

              <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
                <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                <input placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                  <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                </div>
                <input placeholder="Industry / Category" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required />
                <input placeholder="Role Applying For (e.g., Community Member, Expert, Creator, etc.)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                <input placeholder="Website / Social Link (optional)" value={form.website_social} onChange={(e) => setForm({ ...form, website_social: e.target.value })} />
              </div>

              <button className="gold-btn" type="submit" disabled={submitting} style={{ width: "100%", marginTop: "0.5rem" }}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>

              {error ? <p className="status-error" style={{ marginTop: "16px" }}>{error}</p> : null}

              <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}>
                <p className="homepage-feature-title" style={{ marginBottom: "0.75rem" }}>After you apply</p>
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  {nextSteps.map((step) => (
                    <p key={step} className="homepage-feature-copy">{step}</p>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}