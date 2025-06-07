import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { nomineeEmail, nomineeName, requestedSections, message } = await request.json();
    console.log("[DEBUG] Incoming request:", { nomineeEmail, nomineeName, requestedSections, message });
    if (!nomineeEmail || !requestedSections?.length) {
      console.log("[DEBUG] Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const supabase = createAdminClient();

    // Find nominee by email
    const { data: nominee, error: nomineeError } = await supabase
      .from("nominees")
      .select("id, user_id, name, email")
      .eq("email", nomineeEmail)
      .maybeSingle();
    console.log('[API Debug] nominee:', nominee, 'error:', nomineeError);
    if (!nominee) {
      console.log("[DEBUG] Nominee not found");
      return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
    }

    // Find all trustees for the invitor (user_id)
    const { data: trustees, error: trusteesError } = await supabase
      .from("trustees")
      .select("id, email")
      .eq("user_id", nominee.user_id);
    console.log('[API Debug] trustees:', trustees, 'error:', trusteesError);

    if (!trustees || trustees.length === 0) {
      console.log("[DEBUG] No trustees found for invitor");
      return NextResponse.json({ error: "No trustees found for invitor" }, { status: 404 });
    }

    // For each trustee, get the user_id from the users table and insert notification
    for (const trustee of trustees) {
      const { data: trusteeUser, error: trusteeUserError } = await supabase
        .from("users")
        .select("id")
        .eq("email", trustee.email)
        .single();
      if (trusteeUser && trusteeUser.id) {
        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            user_id: trusteeUser.id,
            type: "invitation_received",
            title: "Nominee Access Request",
            message: `${nomineeName} (${nomineeEmail}) requested access to: ${requestedSections.join(", ")}.`,
            data: {
              nomineeId: nominee.id,
              nomineeName,
              nomineeEmail,
              requestedSections,
              message,
              invitorId: nominee.user_id,
            },
            created_at: new Date().toISOString(),
            read: false,
          });
        console.log('[API Debug] notification insert for trustee:', trusteeUser.id, 'error:', notifError);
      } else {
        console.log('[API Debug] No user found for trustee email:', trustee.email, 'error:', trusteeUserError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DEBUG] Error in request-access:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 