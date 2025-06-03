import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { nomineeId } = await request.json();
    if (!nomineeId) {
      return NextResponse.json({ error: "Missing nomineeId" }, { status: 400 });
    }
    const supabase = createAdminClient();

    // Get nominee details
    const { data: nominee, error: nomineeError } = await supabase
      .from("nominees")
      .select("id, user_id, email, status")
      .eq("id", nomineeId)
      .single();
    if (nomineeError || !nominee) {
      return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
    }
    if (nominee.status !== "accepted") {
      return NextResponse.json({ error: "Nominee must accept the request first" }, { status: 400 });
    }

    // Get nominee user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", nominee.email)
      .single();
    if (userError || !user) {
      return NextResponse.json({ error: "Nominee user not found" }, { status: 404 });
    }

    // Get nominee role id
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "nominee")
      .single();
    if (roleError || !role) {
      return NextResponse.json({ error: "Nominee role not found" }, { status: 404 });
    }

    // Add to user_roles
    await supabase.from("user_roles").insert({
      user_id: user.id,
      role_id: role.id,
      related_user_id: nominee.user_id,
      created_at: new Date().toISOString(),
    });

    // Update nominee status
    await supabase.from("nominees").update({ status: "added" }).eq("id", nomineeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in add-nominee-role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 