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
};

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

  const postData = {
    title: payload.title?.trim() || null,
    body: payload.body ?? null,
    post_type: payload.post_type || "article",
    media_url: payload.media_url ?? null,
    link_url: payload.link_url ?? null,
    image_url: payload.image_url ?? null,
    updated_at: new Date().toISOString(),
  };

  if (!postData.title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }

  if (payload.id) {
    const { data: existing, error: selectError } = await (supabase.from("posts") as any)
      .select("author_id")
      .eq("id", payload.id)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: "post_lookup_failed" }, { status: 500 });
    }
    if (!existing || existing.author_id !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { error: updateError } = await (supabase.from("posts") as any)
      .update(postData)
      .eq("id", payload.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message || "post_update_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // Only allow creation for approved professional/legacy-professional roles or admins
  if (!isProfessionalRole(userRole) && !isAdminRole(userRole)) {
    return NextResponse.json({ error: "insufficient_role" }, { status: 403 });
  }

  const createPayload = {
    author_id: userId,
    ...postData,
    created_at: new Date().toISOString(),
  };

  const { data: createdPost, error: insertError } = await (supabase.from("posts") as any)
    .insert(createPayload)
    .select("id")
    .maybeSingle();

  if (insertError) {
    return NextResponse.json({ error: insertError.message || "post_create_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, post: createdPost });
}
