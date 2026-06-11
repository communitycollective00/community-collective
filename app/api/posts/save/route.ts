import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isProfessionalRole, isAdminRole } from "../../../../lib/roles";

type PostPayload = {
  id?: string;
  title?: string;
  body?: string;
  post_type?: string;
  media_url?: string;
  link_url?: string;
  image_url?: string;
  caption?: string | null;
  is_published?: boolean | null;
};

const ALLOWED_POST_COLUMNS = new Set([
  "author_id",
  "title",
  "body",
  "post_type",
  "media_url",
  "image_url",
  "link_url",
  "is_published",
  "created_at",
  "updated_at",
]);

const MISSING_COLUMN_REGEX = /Could not find the '([^']+)' column of 'posts'/;

function stripUndefinedPostValues(data: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function filterAllowedPostColumns(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => ALLOWED_POST_COLUMNS.has(key)));
}

function stripMissingPostColumn(payload: Record<string, unknown>, error: any) {
  const message = typeof error?.message === "string" ? error.message : "";
  const match = MISSING_COLUMN_REGEX.exec(message);
  if (!match) return payload;
  const missingColumn = match[1];
  if (!(missingColumn in payload)) return payload;
  const nextPayload = { ...payload };
  delete nextPayload[missingColumn];
  return nextPayload;
}

function getAlternateOwnershipColumn(column: string) {
  if (column === "author_id") return "user_id";
  if (column === "user_id") return "author_id";
  return null;
}

async function safeInsertPost(supabase: any, payload: Record<string, unknown>) {
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase.from("posts").insert(currentPayload).select("id").maybeSingle();
    if (!error) {
      return { data, error: null };
    }

    const message = typeof error.message === "string" ? error.message : "";
    const match = MISSING_COLUMN_REGEX.exec(message);
    if (!match) {
      return { data: null, error };
    }

    const missingColumn = match[1];
    const alternateColumn = getAlternateOwnershipColumn(missingColumn);

    if (alternateColumn && currentPayload[missingColumn] !== undefined) {
      const value = currentPayload[missingColumn];
      delete currentPayload[missingColumn];
      currentPayload[alternateColumn] = value;
      continue;
    }

    if (missingColumn in currentPayload) {
      delete currentPayload[missingColumn];
      continue;
    }

    return { data: null, error };
  }

  return { data: null, error: { message: "post_create_failed" } as any };
}

async function safeUpdatePost(supabase: any, id: string, payload: Record<string, unknown>) {
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { error } = await supabase.from("posts").update(currentPayload).eq("id", id);
    if (!error) return null;

    const message = typeof error.message === "string" ? error.message : "";
    const match = MISSING_COLUMN_REGEX.exec(message);
    if (!match) return error;

    const missingColumn = match[1];
    if (missingColumn in currentPayload) {
      delete currentPayload[missingColumn];
      continue;
    }
    return error;
  }

  return { message: "post_update_failed" } as any;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
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

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData.user?.id) {
    return NextResponse.json({ error: "invalid_auth_token" }, { status: 401 });
  }

  const payload = (await request.json()) as PostPayload;
  const userId = userData.user.id;

  // fetch user's profile role to enforce publishing permissions
  const { data: profileRow, error: profileError } = await (supabase.from("profiles") as any)
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: "profile_lookup_failed" }, { status: 500 });
  }

  const userRole = profileRow?.role ?? null;

  const titleText =
    payload.title?.trim() ||
    payload.caption?.trim() ||
    (payload.post_type === "video" ? "Video" : payload.post_type === "image" ? "Photo" : "Post");

  const postData = stripUndefinedPostValues({
    title: titleText || null,
    body: payload.body?.trim() ?? payload.caption?.trim() ?? null,
    post_type: payload.post_type || "article",
    media_url: payload.media_url?.trim() || undefined,
    image_url: payload.image_url?.trim() || undefined,
    link_url: payload.link_url?.trim() || undefined,
    is_published: payload.is_published ?? (isProfessionalRole(userRole) || isAdminRole(userRole)),
    updated_at: new Date().toISOString(),
  });

  if (!postData.title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  if (payload.id) {
    let existing: any = null;
    let selectError: any = null;

    const { data: existingAuthor, error: authorError } = await (supabase.from("posts") as any)
      .select("author_id")
      .eq("id", payload.id)
      .maybeSingle();

    if (!authorError) {
      existing = existingAuthor;
    } else if (authorError.message?.includes("Could not find the 'author_id' column of 'posts'")) {
      const { data: existingUser, error: userError } = await (supabase.from("posts") as any)
        .select("user_id")
        .eq("id", payload.id)
        .maybeSingle();
      existing = existingUser;
      selectError = userError;
    } else {
      selectError = authorError;
    }

    if (selectError) {
      return NextResponse.json({ error: "post_lookup_failed" }, { status: 500 });
    }

    const ownsPost = existing && (existing.author_id === userId || existing.user_id === userId);
    if (!ownsPost) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const updatePayload = stripUndefinedPostValues(postData);
    const updateError = await safeUpdatePost(supabase, payload.id, updatePayload);
    if (updateError) {
      return NextResponse.json({ error: updateError.message || "post_update_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // Only allow creation for approved professional/legacy-professional roles or admins
  if (!isProfessionalRole(userRole) && !isAdminRole(userRole)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  const createPayload = stripUndefinedPostValues({
    author_id: userId,
    ...postData,
    created_at: new Date().toISOString(),
  });

  const { data: createdPost, error: insertError } = await safeInsertPost(supabase, createPayload);
  if (insertError) {
    return NextResponse.json({ error: insertError.message || "post_create_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: createdPost });
}
