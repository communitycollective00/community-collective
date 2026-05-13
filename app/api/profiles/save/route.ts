import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ProfilePayload = Record<string, unknown> & { id?: string };

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[api/profiles/save] Missing Supabase server environment variables.");
    return NextResponse.json({ error: "server_configuration_missing" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user?.id) {
    console.error("[api/profiles/save] Invalid user token.", userError);
    return NextResponse.json({ error: "invalid_auth_token" }, { status: 401 });
  }

  const payload = (await request.json()) as ProfilePayload;
  if (!payload?.id || payload.id !== userData.user.id) {
    return NextResponse.json({ error: "invalid_profile_id" }, { status: 403 });
  }

  const { error } = await (supabase.from("profiles") as any).upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    console.error("[api/profiles/save] profile upsert failed", error);
    return NextResponse.json({ error: error.message || "profile_save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
