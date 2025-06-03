import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { notificationId, action } = await request.json();
    if (!notificationId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const supabase = createAdminClient();

    // Fetch the notification
    const { data: notif, error: notifError } = await supabase
      .from("notifications")
      .select("*, data")
      .eq("id", notificationId)
      .single();
    if (notifError || !notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    const { nomineeId, nomineeEmail, requestedSections } = notif.data || {};
    if (!nomineeId || !Array.isArray(requestedSections)) {
      return NextResponse.json({ error: "Invalid notification data" }, { status: 400 });
    }

    // Accept: update nominee's access_categories
    if (action === "accept") {
      // Fetch nominee
      const { data: nominee, error: nomineeError } = await supabase
        .from("nominees")
        .select("id, access_categories, email")
        .eq("id", nomineeId)
        .single();
      if (nomineeError || !nominee) {
        return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
      }
      // Merge access categories
      const current = Array.isArray(nominee.access_categories) ? nominee.access_categories : [];
      const merged = Array.from(new Set([...current, ...requestedSections]));
      // Update nominee
      const { error: updateError } = await supabase
        .from("nominees")
        .update({ access_categories: merged })
        .eq("id", nomineeId);
      if (updateError) {
        return NextResponse.json({ error: "Failed to update nominee" }, { status: 500 });
      }
      // Look up nominee user_id by email
      const { data: nomineeUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", nominee.email)
        .single();
      // Notify nominee
      await supabase.from("notifications").insert({
        user_id: nomineeUser?.id || nominee.email,
        type: "invitation_received",
        title: "Access Request Accepted",
        message: `Your request for access to: ${requestedSections.join(", ")} was accepted by your trustee.`,
        data: { action: "accepted", requestedSections },
        created_at: new Date().toISOString(),
        read: false,
      });
    } else if (action === "reject") {
      // Fetch nominee
      const { data: nominee, error: nomineeError } = await supabase
        .from("nominees")
        .select("id, email")
        .eq("id", nomineeId)
        .single();
      if (nomineeError || !nominee) {
        return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
      }
      // Look up nominee user_id by email
      const { data: nomineeUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", nominee.email)
        .single();
      // Notify nominee
      await supabase.from("notifications").insert({
        user_id: nomineeUser?.id || nominee.email,
        type: "invitation_received",
        title: "Access Request Rejected",
        message: `Your request for access to: ${requestedSections.join(", ")} was rejected by your trustee.`,
        data: { action: "rejected", requestedSections },
        created_at: new Date().toISOString(),
        read: false,
      });
    }
    // Mark the original notification as handled (optional: delete or set read=true)
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[nominee-request-action] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 