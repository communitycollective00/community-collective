import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ProvisionPayload = {
  id?: string;
  email?: string;
  full_name?: string;
  username?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ProvisionPayload;

    if (!payload.id || !payload.email || !payload.full_name || !payload.username) {
      return NextResponse.json({ error: "Missing required profile fields." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Profile provisioning failed:", "Missing Supabase server credentials for profile provisioning.");
      return NextResponse.json({ error: "We couldn't finish setting up your profile. Please try again." }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // If a profile already exists, preserve its role and update other fields.
    const { data: existing } = await (adminClient.from("profiles") as any)
      .select("role")
      .eq("id", payload.id)
      .maybeSingle();

    if (existing) {
      const { error } = await (adminClient.from("profiles") as any).update(
        {
          email: payload.email,
          full_name: payload.full_name,
          username: payload.username,
          is_approved: true,
          updated_at: new Date().toISOString(),
        },
        { returning: "minimal" }
      ).eq("id", payload.id);

      if (error) {
        console.error("Profile provisioning failed with database error:", error);
        return NextResponse.json({ error: "We couldn't finish setting up your profile. Please try again." }, { status: 500 });
      }
    } else {
      const { error } = await (adminClient.from("profiles") as any).insert(
        {
          id: payload.id,
          email: payload.email,
          full_name: payload.full_name,
          username: payload.username,
          role: "public",
          is_approved: true,
          updated_at: new Date().toISOString(),
        }
      );

      if (error) {
        console.error("Profile provisioning failed with database error:", error);
        return NextResponse.json({ error: "We couldn't finish setting up your profile. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Profile provisioning failed with database error:", error);
    return NextResponse.json({ error: "We couldn't finish setting up your profile. Please try again." }, { status: 500 });
  }
}
