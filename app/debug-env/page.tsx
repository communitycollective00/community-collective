import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function DebugEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrlExists = Boolean(supabaseUrl);
  const serviceRoleKeyExists = Boolean(serviceRoleKey);
  const supabaseUrlPreview = supabaseUrl ? supabaseUrl.slice(0, 12) : "";

  let querySuccess = false;
  let queryError: string | null = null;
  let dataReturned = false;
  let data: any = null;

  if (supabaseUrlExists && serviceRoleKeyExists) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: result, error } = await (supabase.from("profiles") as any)
      .select("id,username")
      .eq("username", "dpugh40")
      .maybeSingle();

    querySuccess = !error;
    queryError = error?.message ?? null;
    dataReturned = Boolean(result);
    data = result;
  }

  return (
    <main className="premium-page" style={{ paddingTop: "72px" }}>
      <section className="premium-card dashboard-card" style={{ maxWidth: "700px", margin: "1rem auto" }}>
        <h1>Debug Env</h1>
        <div style={{ marginBottom: "1.25rem", lineHeight: 1.6 }}>
          <p><strong>NEXT_PUBLIC_SUPABASE_URL exists:</strong> {supabaseUrlExists ? "yes" : "no"}</p>
          <p><strong>SUPABASE_SERVICE_ROLE_KEY exists:</strong> {serviceRoleKeyExists ? "yes" : "no"}</p>
          <p><strong>NEXT_PUBLIC_SUPABASE_URL preview:</strong> {supabaseUrlExists ? supabaseUrlPreview : "n/a"}</p>
        </div>

        <div style={{ marginBottom: "1.25rem", lineHeight: 1.6 }}>
          <p><strong>Service-role query executed:</strong> {supabaseUrlExists && serviceRoleKeyExists ? "yes" : "no"}</p>
          <p><strong>Query success:</strong> {supabaseUrlExists && serviceRoleKeyExists ? (querySuccess ? "yes" : "no") : "n/a"}</p>
          <p><strong>Data returned:</strong> {supabaseUrlExists && serviceRoleKeyExists ? (dataReturned ? "yes" : "no") : "n/a"}</p>
          <p><strong>Query error:</strong> {queryError ?? "none"}</p>
          <p><strong>Returned Row:</strong></p>
          <pre
            style={{
              background: "#111",
              color: "#00ff88",
              padding: "1rem",
              borderRadius: "8px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              fontSize: "14px",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <Link href="/">← Back to home</Link>
      </section>
    </main>
  );
}
