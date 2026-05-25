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

function errorResponse(code: string, message?: string, status = 400) {
  return NextResponse.json({ error: code, message: message || code }, { status });
}

function normalizeAuthAdminError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
    return { code: "account_exists", status: 409 };
  }
  if (lower.includes("invalid email")) return { code: "invalid_email", status: 400 };
  if (lower.includes("password")) return { code: "weak_password", status: 400 };
  return { code: "signup_unavailable", status: 503 };
}

function isMissingColumnError(error: { message?: string; details?: string } | null | undefined) {
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return text.includes("could not find") && text.includes("column");
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
      return errorResponse("missing_fields", undefined, 400);
    }
    if (!EMAIL_REGEX.test(email)) return errorResponse("invalid_email", undefined, 400);
    if (!USERNAME_REGEX.test(username)) return errorResponse("invalid_username", undefined, 400);
    if (password.length < 8) return errorResponse("weak_password", undefined, 400);
    if (password !== confirmPassword) return errorResponse("password_mismatch", undefined, 400);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[signup] Missing Supabase env vars");
      return errorResponse("signup_unavailable", undefined, 503);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existingProfile } = await (adminClient.from("profiles") as any)
      .select("id")
      .eq("username", username)
      .limit(1)
      .maybeSingle();

    if (existingProfile) {
      return errorResponse("username_taken", "That username is already taken.", 409);
    }

    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
        role: "public",
        is_approved: true,
      },
    });

    if (createError) {
      console.error("[signup] auth user creation failed", createError);
      const mapped = normalizeAuthAdminError(createError.message);
      return errorResponse(mapped.code, createError.message, mapped.status);
    }

    if (!createData.user?.id) {
      console.error("[signup] signup returned no user");
      return errorResponse("signup_unavailable", undefined, 503);
    }

    const userId = createData.user.id;

    const richProfilePayload = {
      id: userId,
      email,
      full_name: fullName,
      username,
      role: "public",
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let { error: profileError } = await (adminClient.from("profiles") as any).upsert(richProfilePayload, { onConflict: "id" });

    if (profileError && isMissingColumnError(profileError as { message?: string; details?: string })) {
      const { error: fallbackError } = await (adminClient.from("profiles") as any).upsert(
        {
          id: userId,
          full_name: fullName,
          username,
          role: "public",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      profileError = fallbackError ?? null;
    }

    if (profileError) {
      console.error("[signup] profile provisioning failed", profileError);
      const { error: rollbackError } = await adminClient.auth.admin.deleteUser(userId);
      if (rollbackError) {
        console.error("[signup] rollback failed after profile provisioning error", rollbackError);
      }
      if ((profileError as { code?: string }).code === "23505") {
        const profileMessage = String((profileError as { message?: string }).message || "").toLowerCase();
        if (profileMessage.includes("username")) {
          return errorResponse("username_taken", "That username is already taken.", 409);
        }
        if (profileMessage.includes("email")) {
          return errorResponse("account_exists", "Account already exists. Please log in.", 409);
        }
      }
      return errorResponse("signup_unavailable", (profileError as { message?: string }).message, 503);
    }

    return NextResponse.json({ ok: true, hasSession: true });
  } catch (error) {
    console.error("[signup] unexpected server error", error);
    return errorResponse("signup_unavailable", undefined, 503);
  }
}
