import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type SignupPayload = {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;

function errorResponse(code: string, status = 400) {
  return NextResponse.json({ error: code }, { status });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SignupPayload;
    const fullName = payload.fullName?.trim() || "";
    const username = payload.username?.trim().toLowerCase() || "";
    const email = payload.email?.trim().toLowerCase() || "";
    const password = payload.password || "";
    const confirmPassword = payload.confirmPassword || "";

    if (!fullName || !username || !email || !password || !confirmPassword) {
      return errorResponse("missing_fields", 400);
    }
    if (!EMAIL_REGEX.test(email)) return errorResponse("invalid_email", 400);
    if (!USERNAME_REGEX.test(username)) return errorResponse("invalid_username", 400);
    if (password.length < 8) return errorResponse("weak_password", 400);
    if (password !== confirmPassword) return errorResponse("password_mismatch", 400);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("[signup] Missing Supabase env vars");
      return errorResponse("signup_unavailable", 503);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existingProfile } = await (adminClient.from("profiles") as any)
      .select("id")
       .or(`username.eq.${username},email.eq.${email}`)
      .limit(1)
      .maybeSingle();

    if (existingProfile) {
      const { data: usernameOwner } = await (adminClient.from("profiles") as any)
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (usernameOwner) return errorResponse("username_taken", 409);
      return errorResponse("account_exists", 409);
    }

    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/onboarding`,
        data: { full_name: fullName, username },
      },
    });

    if (error) {
      const m = error.message.toLowerCase();
      console.error("[signup] auth signup failed", error.message);
      if (m.includes("already registered") || m.includes("already been registered")) return errorResponse("account_exists", 409);
      if (m.includes("invalid email")) return errorResponse("invalid_email", 400);
      if (m.includes("password")) return errorResponse("weak_password", 400);
      return errorResponse("signup_unavailable", 503);
    }

    if (!data.user?.id) {
      console.error("[signup] signup returned no user");
      return errorResponse("signup_unavailable", 503);
    }

    const { error: profileError } = await (adminClient.from("profiles") as any).insert({
      id: data.user.id,
      email,
      full_name: fullName,
      username,
      role: "member",
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("[signup] profile provisioning failed", profileError);
      return errorResponse("signup_unavailable", 503);
    }

    return NextResponse.json({ ok: true, hasSession: Boolean(data.session) });
  } catch (error) {
    console.error("[signup] unexpected server error", error);
    return errorResponse("signup_unavailable", 503);
  }
}
