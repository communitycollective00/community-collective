"use client";
import { useState, useEffect, useRef } from "react";
import { useAdminGuard } from "../../components/admin-guard";
import { getSupabaseClient } from "../../../lib/supabase";

const SECTIONS = [
  "Featured This Week",
  "Real Game",
  "Opportunities Today",
  "People Building Things",
  "Inside Access",
  "Community Access",
];

const PAGES = [
  { key: "home", label: "Homepage" },
  { key: "directory", label: "The Network" },
  { key: "opportunities", label: "Get In" },
  { key: "voices", label: "The Voices" },
  { key: "profile", label: "Profile" },
  { key: "apply", label: "Apply" },
];

type Slot = {
  id?: string;
  section: string;
  slot_index: number;
  title: string;
  role: string;
  city: string;
  description: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
};

type Background = {
  page_key: string;
  image_url: string;
};

function ImageUploader({
  value,
  onChange,
  uploadPath,
}: {
  value: string;
  onChange: (url: string) => void;
  uploadPath: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const ext = file.name.split(".").pop();
      const filename = `${uploadPath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filename, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("media").getPublicUrl(filename);
      onChange(data.publicUrl);
    } catch (e: any) {
      setError("Upload failed. Try again.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          position: "relative",
          width: "100%",
          height: value ? 120 : 80,
          borderRadius: 10,
          border: `2px dashed ${value ? "transparent" : "var(--border)"}`,
          background: value ? "transparent" : "var(--surface-soft)",
          cursor: uploading ? "not-allowed" : "pointer",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value ? (
          <img src={value} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            {uploading ? (
              <p style={{ color: "var(--gold)", fontSize: "0.85rem" }}>Uploading...</p>
            ) : (
              <>
                <p style={{ fontSize: "1.4rem", marginBottom: 4 }}>📷</p>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Tap to upload or take photo</p>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            flex: 1, padding: "0.45rem 0.75rem", borderRadius: 8,
            border: "1px solid var(--gold2)", background: "transparent",
            color: "var(--gold)", fontSize: "0.8rem", fontWeight: 600,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Choose / Camera"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              padding: "0.45rem 0.75rem", borderRadius: 8,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--muted)", fontSize: "0.8rem", cursor: "pointer",
            }}
          >
            Remove
          </button>
        )}
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: "0.75rem" }}>{error}</p>}
    </div>
  );
}

export default function ControlRoom() {
  const { loading, isAdmin } = useAdminGuard("/admin/control-room");
  const [activeTab, setActiveTab] = useState<"cards" | "backgrounds">("cards");
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isAdmin) {
      loadSlots();
      loadBackgrounds();
    }
  }, [isAdmin]);

  async function loadSlots() {
    const supabase = getSupabaseClient();
    const { data } = await (supabase.from("homepage_slots") as any).select("*").order("slot_index");
    setSlots(data || []);
  }

  async function loadBackgrounds() {
    const supabase = getSupabaseClient();
    const { data } = await (supabase.from("page_backgrounds") as any).select("*");
    const map: Record<string, string> = {};
    (data || []).forEach((b: Background) => { map[b.page_key] = b.image_url; });
    setBackgrounds(map);
  }

  function getSectionSlots(section: string) {
    const existing = slots.filter((s) => s.section === section);
    const result: Slot[] = [];
    for (let i = 0; i < 3; i++) {
      result.push(
        existing.find((s) => s.slot_index === i) || {
          section, slot_index: i, title: "", role: "", city: "",
          description: "", image_url: "", link_url: "", is_active: true,
        }
      );
    }
    return result;
  }

  function updateSlot(section: string, index: number, field: string, value: string) {
    setSlots((prev) => {
      const existing = prev.find((s) => s.section === section && s.slot_index === index);
      if (existing) {
        return prev.map((s) =>
          s.section === section && s.slot_index === index ? { ...s, [field]: value } : s
        );
      }
      return [...prev, {
        section, slot_index: index, title: "", role: "", city: "",
        description: "", image_url: "", link_url: "", is_active: true, [field]: value,
      }];
    });
  }

  async function saveSlots() {
    setSaving(true);
    setStatus("");
    const supabase = getSupabaseClient();
    const sectionSlots = getSectionSlots(activeSection);
    try {
      for (const slot of sectionSlots) {
        if (!slot.title && !slot.image_url) continue;
        await (supabase.from("homepage_slots") as any).upsert({
          section: slot.section, slot_index: slot.slot_index, title: slot.title,
          role: slot.role, city: slot.city, description: slot.description,
          image_url: slot.image_url, link_url: slot.link_url, is_active: slot.is_active,
          updated_at: new Date().toISOString(),
        }, { onConflict: "section,slot_index" });
      }
      setStatus("✓ Saved.");
      loadSlots();
    } catch (e) {
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBackground(pageKey: string, url: string) {
    setSaving(true);
    const supabase = getSupabaseClient();
    await (supabase.from("page_backgrounds") as any).upsert({
      page_key: pageKey, image_url: url, updated_at: new Date().toISOString(),
    }, { onConflict: "page_key" });
    setBackgrounds((prev) => ({ ...prev, [pageKey]: url }));
    setSaving(false);
    setStatus("✓ Background saved.");
  }

  if (loading) return <main className="premium-page" style={{ paddingTop: 92 }}><p style={{ padding: "2rem" }}>Loading...</p></main>;
  if (!isAdmin) return <main className="premium-page" style={{ paddingTop: 92 }}><p style={{ padding: "2rem", color: "var(--red)" }}>Access denied.</p></main>;

  return (
    <main className="premium-page" style={{ paddingTop: 92, minHeight: "100vh" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--gold)", marginBottom: 4 }}>
          🔑 Control Room
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Hidden admin panel — homepage content + page backgrounds
        </p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {(["cards", "backgrounds"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "0.6rem 1.4rem", borderRadius: 999, border: "1px solid var(--gold2)",
              background: activeTab === tab ? "var(--gold)" : "transparent",
              color: activeTab === tab ? "#000" : "var(--gold)", cursor: "pointer", fontWeight: 600,
            }}>
              {tab === "cards" ? "Homepage Cards" : "Page Backgrounds"}
            </button>
          ))}
        </div>

        {status && <p style={{ color: "var(--accent)", marginBottom: "1rem" }}>{status}</p>}

        {activeTab === "cards" && (
          <div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => setActiveSection(s)} style={{
                  padding: "0.5rem 1rem", borderRadius: 999, fontSize: "0.85rem", cursor: "pointer",
                  border: "1px solid var(--border)",
                  background: activeSection === s ? "var(--gold-soft)" : "transparent",
                  color: activeSection === s ? "var(--gold)" : "var(--muted)",
                }}>{s}</button>
              ))}
            </div>

            <h2 style={{ color: "var(--text)", marginBottom: "1rem", fontSize: "1.2rem" }}>
              {activeSection} — 3 Card Slots
            </h2>

            {getSectionSlots(activeSection).map((slot, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "1.25rem", marginBottom: "1rem",
              }}>
                <p style={{ color: "var(--gold2)", fontSize: "0.8rem", marginBottom: "0.75rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                  SLOT {i + 1}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {([["Title", "title"], ["Role", "role"], ["City", "city"]] as [string, string][]).map(([label, field]) => (
                    <div key={field}>
                      <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>{label}</label>
                      <input
                        value={(slot as any)[field] || ""}
                        onChange={(e) => updateSlot(activeSection, i, field, e.target.value)}
                        style={{
                          width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8,
                          border: "1px solid var(--border)", background: "var(--surface-soft)",
                          color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" as const,
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Links To</label>
                    <select
                      value={["/voices","/opportunities","/directory","/get-access","/apply","/press","/posts"].includes(slot.link_url) ? slot.link_url : (slot.link_url ? "__custom__" : "")}
                      onChange={(e) => { const v = e.target.value; if (v !== "__custom__") updateSlot(activeSection, i, "link_url", v === "" ? "" : v); }}
                      style={{
                        width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8,
                        border: "1px solid var(--border)", background: "var(--surface-soft)",
                        color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" as const,
                      }}
                    >
                      <option value="">— No link —</option>
                      <option value="/voices">The Voices</option>
                      <option value="/opportunities">Opportunities</option>
                      <option value="/directory">The Network (Directory)</option>
                      <option value="/get-access">Get Access</option>
                      <option value="/apply">Apply</option>
                      <option value="/press">Press Room</option>
                      <option value="/posts">All Posts</option>
                      <option value="__custom__">Custom URL\u2026</option>
                    </select>
                    <input
                      value={slot.link_url || ""}
                      onChange={(e) => updateSlot(activeSection, i, "link_url", e.target.value)}
                      placeholder="Or paste a custom link (e.g. /posts/abc123 or https://\u2026)"
                      style={{
                        width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, marginTop: "0.5rem",
                        border: "1px solid var(--border)", background: "var(--surface-soft)",
                        color: "var(--text)", fontSize: "0.85rem", boxSizing: "border-box" as const,
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Description</label>
                    <textarea
                      value={slot.description || ""}
                      onChange={(e) => updateSlot(activeSection, i, "description", e.target.value)}
                      rows={2}
                      style={{
                        width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8,
                        border: "1px solid var(--border)", background: "var(--surface-soft)",
                        color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" as const,
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Card Image</label>
                    <ImageUploader
                      value={slot.image_url || ""}
                      onChange={(url) => updateSlot(activeSection, i, "image_url", url)}
                      uploadPath={`control-room/slots/${activeSection.toLowerCase().replace(/\s+/g, "-")}`}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={saveSlots} disabled={saving} className="gold-btn" style={{ marginTop: "0.5rem" }}>
              {saving ? "Saving..." : `Save ${activeSection}`}
            </button>
          </div>
        )}

        {activeTab === "backgrounds" && (
          <div>
            <h2 style={{ color: "var(--text)", marginBottom: "0.5rem", fontSize: "1.2rem" }}>Page Backgrounds</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Upload a photo for each page. Changes go live immediately.
            </p>
            {PAGES.map((page) => (
              <div key={page.key} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "1.25rem", marginBottom: "1rem",
              }}>
                <label style={{ fontSize: "0.85rem", color: "var(--gold2)", display: "block", marginBottom: 10, fontWeight: 700, letterSpacing: "0.06em" }}>
                  {page.label}
                </label>
                <ImageUploader
                  value={backgrounds[page.key] || ""}
                  onChange={(url) => {
                    setBackgrounds((prev) => ({ ...prev, [page.key]: url }));
                    saveBackground(page.key, url);
                  }}
                  uploadPath="control-room/backgrounds"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}