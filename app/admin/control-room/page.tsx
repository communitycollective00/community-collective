"use client";
import { useState, useEffect } from "react";
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
    const existing = slots.filter(s => s.section === section);
    const result: Slot[] = [];
    for (let i = 0; i < 3; i++) {
      result.push(existing.find(s => s.slot_index === i) || {
        section, slot_index: i, title: "", role: "", city: "",
        description: "", image_url: "", link_url: "", is_active: true,
      });
    }
    return result;
  }

  function updateSlot(section: string, index: number, field: string, value: string) {
    setSlots(prev => {
      const existing = prev.find(s => s.section === section && s.slot_index === index);
      if (existing) {
        return prev.map(s => s.section === section && s.slot_index === index ? { ...s, [field]: value } : s);
      }
      return [...prev, { section, slot_index: index, title: "", role: "", city: "", description: "", image_url: "", link_url: "", is_active: true, [field]: value }];
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
          section: slot.section,
          slot_index: slot.slot_index,
          title: slot.title,
          role: slot.role,
          city: slot.city,
          description: slot.description,
          image_url: slot.image_url,
          link_url: slot.link_url,
          is_active: slot.is_active,
          updated_at: new Date().toISOString(),
        }, { onConflict: "section,slot_index" });
      }
      setStatus("Saved.");
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
      page_key: pageKey, image_url: url, updated_at: new Date().toISOString()
    }, { onConflict: "page_key" });
    setBackgrounds(prev => ({ ...prev, [pageKey]: url }));
    setSaving(false);
    setStatus("Background saved.");
  }

  if (loading) return <main className="premium-page" style={{ paddingTop: 92 }}><p className="muted" style={{ padding: "2rem" }}>Loading...</p></main>;
  if (!isAdmin) return <main className="premium-page" style={{ paddingTop: 92 }}><p style={{ padding: "2rem", color: "var(--red)" }}>Access denied.</p></main>;

  return (
    <main className="premium-page" style={{ paddingTop: 92, minHeight: "100vh" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", color: "var(--gold)", marginBottom: 4 }}>🔑 Control Room</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>Hidden admin panel — homepage content + page backgrounds</p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          {(["cards", "backgrounds"] as const).map(tab => (
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
              {SECTIONS.map(s => (
                <button key={s} onClick={() => setActiveSection(s)} style={{
                  padding: "0.5rem 1rem", borderRadius: 999, fontSize: "0.85rem", cursor: "pointer",
                  border: "1px solid var(--border)", background: activeSection === s ? "var(--gold-soft)" : "transparent",
                  color: activeSection === s ? "var(--gold)" : "var(--muted)",
                }}>{s}</button>
              ))}
            </div>

            <h2 style={{ color: "var(--text)", marginBottom: "1rem", fontSize: "1.2rem" }}>{activeSection} — 3 Card Slots</h2>

            {getSectionSlots(activeSection).map((slot, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
                <p style={{ color: "var(--gold2)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>SLOT {i + 1}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    ["Title", "title"], ["Role", "role"], ["City", "city"],
                    ["Image URL", "image_url"], ["Link URL", "link_url"],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>{label}</label>
                      <input
                        value={(slot as any)[field] || ""}
                        onChange={e => updateSlot(activeSection, i, field, e.target.value)}
                        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-soft)", color: "var(--text)", fontSize: "0.9rem" }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Description</label>
                    <textarea
                      value={slot.description || ""}
                      onChange={e => updateSlot(activeSection, i, "description", e.target.value)}
                      rows={2}
                      style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-soft)", color: "var(--text)", fontSize: "0.9rem" }}
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
            <h2 style={{ color: "var(--text)", marginBottom: "1rem", fontSize: "1.2rem" }}>Page Backgrounds</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Paste an image URL for each page. Changes go live immediately.</p>
            {PAGES.map(page => (
              <div key={page.key} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--gold2)", display: "block", marginBottom: 6 }}>{page.label}</label>
                  <input
                    value={backgrounds[page.key] || ""}
                    onChange={e => setBackgrounds(prev => ({ ...prev, [page.key]: e.target.value }))}
                    placeholder="https://your-image-url.com/photo.jpg"
                    style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-soft)", color: "var(--text)", fontSize: "0.9rem" }}
                  />
                  {backgrounds[page.key] && (
                    <img src={backgrounds[page.key]} alt="preview" style={{ marginTop: 8, height: 60, borderRadius: 6, objectFit: "cover", width: "100%" }} />
                  )}
                </div>
                <button onClick={() => saveBackground(page.key, backgrounds[page.key] || "")} disabled={saving} className="gold-btn" style={{ whiteSpace: "nowrap" }}>
                  Save
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
