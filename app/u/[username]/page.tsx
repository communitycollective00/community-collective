import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ProfileHeader } from "../../components/profile-header";

type ProfileRow = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  is_featured?: boolean | null;
  is_approved?: boolean | null;
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
};

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px" }}>
        <section className="premium-card">
          <h1>Profile not found</h1>
          <p className="muted">We couldn't find a profile with that username.</p>
          <Link href="/directory" className="gold-link">
            ← Back to Directory
          </Link>
        </section>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const uname = params.username?.trim().toLowerCase();

  const { data, error } = await (supabase.from("profiles") as any)
    .select(
      "id,full_name,username,bio,description,industry,location,city,state,avatar_url,banner_url,is_featured,is_approved,website,instagram,twitter,linkedin"
    )
    .eq("username", uname)
    .maybeSingle();

  if (!data) {
    return (
      <main className="premium-page" style={{ paddingTop: "72px" }}>
        <section className="premium-card">
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
            <p><strong>Debug: Username requested:</strong> {uname}</p>
            <p><strong>Debug: Supabase error:</strong></p>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "0.85rem" }}>{JSON.stringify(error, null, 2)}</pre>
            <p><strong>Debug: Data:</strong></p>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "0.85rem" }}>{JSON.stringify(data, null, 2)}</pre>
          </div>
          <h1>Profile not found</h1>
          <p className="muted">We couldn't find a profile with that username.</p>
          <Link href="/directory" className="gold-link">
            ← Back to Directory
          </Link>
        </section>
      </main>
    );
  }

  const profileRow: ProfileRow = data;

  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: "900px", margin: "1rem auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/directory" className="gold-link">← Back to Directory</Link>
        </div>

        <ProfileHeader profile={profileRow} />

        <section>
          {/* Additional public-facing info */}
          <div style={{ marginTop: "1rem" }}>
            {profileRow.description && (
              <div style={{ marginBottom: "1rem", lineHeight: 1.8 }}>{profileRow.description}</div>
            )}

            <div style={{ display: "grid", gap: "0.5rem" }}>
              {profileRow.website && (
                <a href={profileRow.website} target="_blank" rel="noopener noreferrer" className="gold-link">
                  🌐 {profileRow.website}
                </a>
              )}
              {profileRow.instagram && (
                <a href={`https://instagram.com/${profileRow.instagram}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                  📸 @{profileRow.instagram}
                </a>
              )}
              {profileRow.twitter && (
                <a href={`https://twitter.com/${profileRow.twitter}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                  𝕏 @{profileRow.twitter}
                </a>
              )}
              {profileRow.linkedin && (
                <a href={`https://linkedin.com/in/${profileRow.linkedin}`} target="_blank" rel="noopener noreferrer" className="gold-link">
                  💼 {profileRow.linkedin}
                </a>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
