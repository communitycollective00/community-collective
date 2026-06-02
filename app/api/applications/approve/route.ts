import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { upsertProfileWithRetry, createUsernamePlaceholder } from "../../../../lib/profile-provisioning";

type ApprovePayload = {
  applicationId: string;
};

function mapApplicationTypeToRole(applicationType: string): string {
  if (applicationType === "professional_organization") return "professional";
  return "member";
}

export async function POST(request: Request) {
  try {
    // Validate admin auth
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "unauthorized", message: "Authentication required." }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[applications/approve] Missing Supabase env vars");
      return NextResponse.json({ error: "server_error", message: "Server configuration error." }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify admin role
    const { data: userData, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !userData.user?.id) {
      console.error("[applications/approve] Auth user lookup failed", authError);
      return NextResponse.json({ error: "unauthorized", message: "Invalid authentication." }, { status: 401 });
    }

    const adminUserId = userData.user.id;
    const { data: adminProfile, error: adminProfileError } = await (adminClient.from("profiles") as any)
      .select("role")
      .eq("id", adminUserId)
      .maybeSingle();

    if (adminProfileError || !adminProfile || adminProfile.role !== "admin") {
      console.error("[applications/approve] Admin check failed", adminProfileError);
      return NextResponse.json({ error: "forbidden", message: "Admin access required." }, { status: 403 });
    }

    // Parse request
    const payload = (await request.json()) as ApprovePayload;
    const { applicationId } = payload;

    if (!applicationId) {
      return NextResponse.json({ error: "invalid_request", message: "Application ID required." }, { status: 400 });
    }

    // Fetch application
    const { data: application, error: appError } = await (adminClient.from("applications") as any)
      .select("*")
      .eq("id", applicationId)
      .maybeSingle();

    if (appError || !application) {
      console.error("[applications/approve] Application not found", appError);
      return NextResponse.json({ error: "not_found", message: "Application not found." }, { status: 404 });
    }

    // Determine role based on application type
    const roleToAssign = mapApplicationTypeToRole(application.application_type);
    const applicantEmail = application.email.toLowerCase();
    const applicantName = application.full_name;

    // Check if auth account exists
    let userId: string;
    let isNewAccount = false;

    const { data: existingUsersData } = await adminClient.auth.admin.listUsers();
    const existingUsers = (existingUsersData as any)?.users || [];
    const existingUser = existingUsers.find((u: any) => u.email?.toLowerCase() === applicantEmail);

    if (existingUser) {
      // Auth account already exists
      userId = existingUser.id;
      console.log(`[applications/approve] Auth account already exists for ${applicantEmail}`);
    } else {
      // Create new auth account with temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + "Aa1!";

      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email: applicantEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: applicantName,
        },
      });

      if (createError || !createData.user?.id) {
        console.error("[applications/approve] Auth account creation failed", createError);
        return NextResponse.json(
          { error: "account_creation_failed", message: "Failed to create member account." },
          { status: 500 }
        );
      }

      userId = createData.user.id;
      isNewAccount = true;
      console.log(`[applications/approve] Auth account created for ${applicantEmail}`);
    }

    // Generate unique username from email prefix + user id
    const emailPrefix = applicantEmail.split("@")[0];
    const sanitized = emailPrefix?.replace(/[^a-z0-9._]/gi, "") || "user";
    const userIdPrefix = userId.replace(/-/g, "").slice(0, 8);
    const username = `${sanitized}_${userIdPrefix}`;

    // Provision or update profile
    try {
      await upsertProfileWithRetry(adminClient as any, {
        id: userId,
        email: applicantEmail,
        fullName: applicantName,
        username: username,
        role: roleToAssign,
      });

      console.log(`[applications/approve] Profile provisioned for ${applicantEmail} with role ${roleToAssign}`);
    } catch (profileError) {
      console.error("[applications/approve] Profile provisioning failed", profileError);
      console.error("PROFILE PROVISION ERROR:", profileError);
      return NextResponse.json(
        {
          error: "profile_provisioning_failed",
          message: "Failed to provision member profile.",
          details: String(profileError)
        },
        { status: 500 }
      );
    }

    // Update application status to approved
    const { error: updateError } = await (adminClient.from("applications") as any)
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (updateError) {
      console.error("[applications/approve] Application status update failed", updateError);
      return NextResponse.json(
        { error: "status_update_failed", message: "Failed to update application status." },
        { status: 500 }
      );
    }

    console.log(`[applications/approve] Application ${applicationId} approved for user ${userId}`);

    return NextResponse.json({
      ok: true,
      userId,
      email: applicantEmail,
      role: roleToAssign,
      newAccount: isNewAccount,
      message: `${applicantName} has been approved as a ${roleToAssign}.`,
    });
  } catch (error) {
    console.error("[applications/approve] Unexpected error", error);
    return NextResponse.json({ error: "server_error", message: "An unexpected error occurred." }, { status: 500 });
  }
}
