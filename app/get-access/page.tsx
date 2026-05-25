"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import AuthNavbar from "../components/auth-navbar";

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

export default function GetAccessPage() {
  const [form, setForm] = useState<ApplicationForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (submitError: any) {
      setError(submitError?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="premium-page">
        <AuthNavbar />
        <section className="premium-card">
          <h1>Application Submitted</h1>
          <p className="muted" style={{ fontSize: "16px", lineHeight: "1.6", marginTop: "16px" }}>
            Application received. If approved, you'll receive access instructions.
          </p>
          <p className="muted" style={{ marginTop: "24px", fontSize: "14px" }}>
            Thank you for your interest in The Community Collective.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-page">
      <AuthNavbar />
      <section className="premium-card">
        <h1>Get Access</h1>
        <p className="muted">Join The Community Collective. Apply as a Public Member to browse and explore, or as a Professional/Organization to share knowledge.</p>

        <form className="premium-form" onSubmit={onSubmit}>
          {/* Application Type Selection */}
          <fieldset style={{ border: "1px solid #333", borderRadius: "4px", padding: "16px", marginBottom: "24px" }}>
            <legend style={{ padding: "0 8px", color: "#C9A84C", fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em" }}>
              APPLYING AS
            </legend>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
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
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
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

          {/* Name */}
          <input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />

          {/* Email */}
          <input
            placeholder="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {/* Phone (Optional) */}
          <input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          {/* City and State */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
          </div>

          {/* Industry/Category */}
          <input
            placeholder="Industry / Category"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            required
          />

          {/* Role Applying For */}
          <input
            placeholder="Role Applying For (e.g., Community Member, Expert, Creator, etc.)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />

          {/* Website/Social (Optional) */}
          <input
            placeholder="Website / Social Link (optional)"
            value={form.website_social}
            onChange={(e) => setForm({ ...form, website_social: e.target.value })}
          />

          {/* Submit Button */}
          <button className="gold-btn" type="submit" disabled={submitting} style={{ marginTop: "24px" }}>
            {submitting ? "Submitting..." : "Submit Application"}
          </button>

          {error ? <p className="status-error" style={{ marginTop: "16px" }}>{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
