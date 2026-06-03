"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import { useAuth } from "../components/auth-provider";

export default function RecommendPage() {
  const { user, loading } = useAuth();
  const [submissionType, setSubmissionType] = useState("person");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [websiteSocial, setWebsiteSocial] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !location.trim() || !reason.trim() || !email.trim() || !websiteSocial.trim()) {
      setStatus("Please fill in all required fields (Name, Email, Location, Reason, Website / Social Link).");
      return;
    }

    if (reason.trim().length < 10) {
      setStatus("Reason should be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("recommendations").insert({
        submission_type: submissionType,
        name: name.trim(),
        organization: organization.trim() || null,
        email: email.trim() || null,
        location: location.trim(),
        reason: reason.trim(),
        website_social: websiteSocial.trim() || null,
        additional_notes: notes.trim() || null,
        submitted_by: user?.id || null,
        submitted_email: user?.email || null,
      });

      if (error) {
        setStatus(`Error: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Success
      setStatus("Thank you! Your spotlight has been submitted for review.");
      setSubmissionType("person");
      setName("");
      setOrganization("");
      setEmail("");
      setLocation("");
      setReason("");
      setWebsiteSocial("");
      setNotes("");
      setTimeout(() => setStatus(""), 5000);
    } catch (err: any) {
      setStatus(`Error: ${err?.message || "Failed to submit spotlight."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="premium-page" style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="premium-card" style={{ maxWidth: 700, margin: "2rem auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Spotlight Someone</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>
          Nominate someone for a feature, interview, spotlight, or community recognition.
        </p>

        <form onSubmit={handleSubmit} className="premium-form">
          <label className="field-label">What are you spotlighting? *</label>
          <select
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            style={{
              background: "#111",
              border: "1px solid #4c3a18",
              color: "#f8f3e7",
              borderRadius: "10px",
              padding: "0.75rem",
              fontFamily: "inherit",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            <option value="person">Person / Professional</option>
            <option value="business">Business / Organization</option>
            <option value="speaker">Speaker / Educator</option>
            <option value="mentor">Mentor / Coach</option>
            <option value="event">Event</option>
            <option value="opportunity">Opportunity / Job</option>
            <option value="community_story">Community Story / Content</option>
          </select>

          <label className="field-label">Name / Title *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Person's name, business name, or event title"
            required
          />

          <label className="field-label">Organization (optional)</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Company, nonprofit, or affiliation"
          />

          <label className="field-label">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Contact email"
            required
          />

          <label className="field-label">Location *</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state, or region"
            required
          />

          <label className="field-label">Why are you recommending them? *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us what makes them valuable to the community. What do they contribute or offer?"
            rows={5}
            required
            style={{
              background: "#111",
              border: "1px solid #4c3a18",
              color: "#f8f3e7",
              borderRadius: "10px",
              padding: "0.75rem",
              fontFamily: "inherit",
              fontSize: "1rem",
              resize: "vertical",
            }}
          />

          <label className="field-label">Website / Social Link *</label>
          <input
            type="text"
            value={websiteSocial}
            onChange={(e) => setWebsiteSocial(e.target.value)}
            placeholder="https://example.com or @username"
            required
          />

          <label className="field-label">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other details we should know?"
            rows={3}
            style={{
              background: "#111",
              border: "1px solid #4c3a18",
              color: "#f8f3e7",
              borderRadius: "10px",
              padding: "0.75rem",
              fontFamily: "inherit",
              fontSize: "1rem",
              resize: "vertical",
            }}
          />

          <button
            className="gold-btn"
            type="submit"
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.85rem", fontWeight: 700 }}
          >
            {isSubmitting ? "Submitting..." : "Submit Spotlight"}
          </button>
        </form>

        {status && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor:
                status.includes("Error") || status.includes("Please") || status.includes("should")
                  ? "rgba(201, 74, 74, 0.1)"
                  : "rgba(61, 190, 138, 0.1)",
              borderLeft: `3px solid ${
                status.includes("Error") || status.includes("Please") || status.includes("should")
                  ? "#C94A4A"
                  : "#3DBE8A"
              }`,
              color:
                status.includes("Error") || status.includes("Please") || status.includes("should")
                  ? "#ffb1b1"
                  : "#94f0c7",
              fontSize: "0.95rem",
              lineHeight: "1.6",
            }}
          >
            {status}
          </div>
        )}

        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#d3c18e", textAlign: "center" }}>
          Submissions are reviewed and may be featured on the platform.{" "}
          <Link href="/" style={{ color: "#f4cf70", textDecoration: "underline" }}>
            Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}
