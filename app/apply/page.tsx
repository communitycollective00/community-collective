"use client";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const initial = { professional_name: "", phone: "", category: "", industry: "", city: "", state: "", location: "", website: "", credentials: "", featured_reason: "", description: "" };
export default function ApplyPage() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    getSupabaseClient().auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
        return;
      }
      setUserId(data.session.user.id);
      setUserEmail(data.session.user.email ?? "");
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!userEmail) {
      setStatus("Unable to submit application without an email address.");
      return;
    }

    setStatus("Submitting application...");

    try {
      const supabase = getSupabaseClient();
      const { error } = await (supabase.from("applications") as any).insert({
        full_name: form.professional_name,
        email: userEmail,
        phone: form.phone || null,
        city: form.city,
        state: form.state,
        application_type: "professional_organization",
        industry: form.industry || form.category,
        reason: form.featured_reason || form.description || "",
        website_social: form.website || null,
        status: "pending",
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      setForm(initial);
      setStatus("Application submitted.");
    } catch (err: any) {
      setStatus(err?.message ?? "Failed to submit application.");
    }
  };

  return (
    <main className="premium-page">
      <section className="premium-card">
        <h1>Apply to be a verified professional</h1>
        <p className="muted">Submit your application to be reviewed for verified professional access.</p>
        <form onSubmit={submit} className="premium-form">
          {Object.entries(initial).map(([k]) => (
            <input
              key={k}
              required={!["website", "phone"].includes(k)}
              placeholder={k.replace(/_/g, " ")}
              value={(form as any)[k] ?? ""}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
          <button className="gold-btn" type="submit">
            Submit Application
          </button>
        </form>
        {status && <p className="muted">{status}</p>}
      </section>
    </main>
  );
}
