"use client";
import { getCachedBg } from "../../lib/background-cache";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const initial = {
  professional_name: "",
  phone: "",
  category: "",
  industry: "",
  city: "",
  state: "",
  location: "",
  website: "",
  credentials: "",
  featured_reason: "",
  description: "",
};

export default function ApplyPage() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [pageBg, setPageBg] = useState<string>(() => getCachedBg("apply"));

  useEffect(() => {
    async function loadAll() {
      const supabase = getSupabaseClient();

      const [sessionRes, bgRes] = await Promise.all([
        supabase.auth.getSession(),
        (supabase.from("page_backgrounds") as any).select("*").eq("page_key", "apply").limit(1),
      ]);

      if (!sessionRes.data.session) {
        window.location.href = "/login";
        return;
      }
      setUserId(sessionRes.data.session.user.id);
      setUserEmail(sessionRes.data.session.user.email ?? "");

      const bgRow = Array.isArray(bgRes.data) ? bgRes.data[0] : bgRes.data;
      if (bgRow?.image_url) setPageBg(bgRow.image_url);
    }
    loadAll();
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

      const content = {
        professional_name: form.professional_name,
        phone: form.phone || null,
        category: form.category || null,
        industry: form.industry || null,
        city: form.city || null,
        state: form.state || null,
        location: form.location || null,
        website: form.website || null,
        credentials: form.credentials || null,
        featured_reason: form.featured_reason || null,
        description: form.description || null,
        user_id: userId,
        user_email: userEmail,
      };

      const { error } = await (supabase.from("submissions") as any).insert({
        type: "professional_application",
        title: form.professional_name,
        content: JSON.stringify(content),
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

  const bgStyle = pageBg
    ? { backgroundImage: `url(${pageBg})`, backgroundSize: "cover", backgroundPosition: "center top", backgroundAttachment: "fixed" }
    : {};

  return (
    <main className="premium-page" style={{ ...bgStyle }}>
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