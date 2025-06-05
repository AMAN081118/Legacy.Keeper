import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[nominee-request-action] Incoming body:", body);
    const { notificationId, action } = body;
    if (!notificationId || !["accept", "reject"].includes(action)) {
      console.error("[nominee-request-action] Invalid request params:", { notificationId, action });
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const supabase = createAdminClient();

    // Fetch the notification
    const { data: notif, error: notifError } = await supabase
      .from("notifications")
      .select("*, data")
      .eq("id", notificationId)
      .single();
    console.log("[nominee-request-action] Notification fetch:", notif, notifError);
    if (notifError || !notif) {
      console.error("[nominee-request-action] Notification not found:", notifError);
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const { nomineeId, nomineeEmail, requestedSections } = notif.data || {};
    console.log("[nominee-request-action] Notification data:", notif.data);

    // Validate based on notification type
    if (notif.type === "nominee_request") {
      // For nominee requests, we only need nomineeId
      if (!nomineeId) {
        console.error("[nominee-request-action] Invalid nominee request data:", notif.data);
        return NextResponse.json({ error: "Invalid nominee request data" }, { status: 400 });
      }
    } else if (notif.type === "invitation_received") {
      // For access requests, we need all fields
      if (!nomineeId || !nomineeEmail || !Array.isArray(requestedSections)) {
        console.error("[nominee-request-action] Invalid access request data:", notif.data);
        return NextResponse.json({ error: "Invalid access request data" }, { status: 400 });
      }
    } else {
      console.error("[nominee-request-action] Unsupported notification type:", notif.type);
      return NextResponse.json({ error: "Unsupported notification type" }, { status: 400 });
    }

    // Accept: update nominee's access_categories
    if (action === "accept") {
      // Fetch nominee
      const { data: nominee, error: nomineeError } = await supabase
        .from("nominees")
        .select("id, access_categories, email")
        .eq("id", nomineeId)
        .single();
      console.log("[nominee-request-action] Nominee fetch (accept):", nominee, nomineeError);
      if (nomineeError || !nominee) {
        console.error("[nominee-request-action] Nominee not found (accept):", nomineeError);
        return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
      }

      if (notif.type === "invitation_received") {
        // For access requests, merge access categories
        const current = Array.isArray(nominee.access_categories) ? nominee.access_categories : [];
        const merged = Array.from(new Set([...current, ...requestedSections]));
        // Update nominee
        const { error: updateError } = await supabase
          .from("nominees")
          .update({ access_categories: merged })
          .eq("id", nomineeId);
        console.log("[nominee-request-action] Nominee update error (accept):", updateError);
        if (updateError) {
          return NextResponse.json({ error: "Failed to update nominee" }, { status: 500 });
        }
      } else {
        // For nominee requests, update status to accepted
        const { error: updateError } = await supabase
          .from("nominees")
          .update({ status: "accepted" })
          .eq("id", nomineeId);
        if (updateError) {
          return NextResponse.json({ error: "Failed to update nominee status" }, { status: 500 });
        }
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
        title: notif.type === "invitation_received" ? "Access Request Accepted" : "Nominee Request Accepted",
        message: notif.type === "invitation_received" 
          ? `Your request for access to: ${requestedSections.join(", ")} was accepted by your trustee.`
          : "You have successfully accepted the request to be a nominee.",
        data: { 
          action: "accepted",
          ...(notif.type === "invitation_received" ? { requestedSections } : {})
        },
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
      console.log("[nominee-request-action] Nominee fetch (reject):", nominee, nomineeError);
      if (nomineeError || !nominee) {
        console.error("[nominee-request-action] Nominee not found (reject):", nomineeError);
        return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
      }

      if (notif.type === "nominee_request") {
        // For nominee requests, update status to rejected
        const { error: updateError } = await supabase
          .from("nominees")
          .update({ status: "rejected" })
          .eq("id", nomineeId);
        if (updateError) {
          return NextResponse.json({ error: "Failed to update nominee status" }, { status: 500 });
        }
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
        title: notif.type === "invitation_received" ? "Access Request Rejected" : "Nominee Request Rejected",
        message: notif.type === "invitation_received"
          ? `Your request for access to: ${requestedSections.join(", ")} was rejected by your trustee.`
          : "Your request to be a nominee was rejected.",
        data: { 
          action: "rejected",
          ...(notif.type === "invitation_received" ? { requestedSections } : {})
        },
        created_at: new Date().toISOString(),
        read: false,
      });
    }

    // Mark the original notification as handled
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[nominee-request-action] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 