import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { nomineeId } = await request.json();
    if (!nomineeId) {
      return NextResponse.json({ error: "Missing nomineeId" }, { status: 400 });
    }
    const supabase = createAdminClient();
    
    // Update nominee status
    const { error } = await supabase
      .from("nominees")
      .update({ status: "pending" })
      .eq("id", nomineeId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get nominee details including user_id
    const { data: nominee } = await supabase
      .from("nominees")
      .select("email, name, user_id")
      .eq("id", nomineeId)
      .single();

    console.log("Nominee details:", nominee);

    if (!nominee) {
      return NextResponse.json({ error: "Nominee not found" }, { status: 404 });
    }

    // Get the user ID for the nominee's email
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", nominee.email)
      .single();

    console.log("User data for nominee:", userData);

    if (userData) {
      // Create notification for the nominee
      const nomineeNotification = {
        user_id: userData.id,
        type: "nominee_request",
        title: "Nominee Request",
        message: `You have received a request to be a nominee. Please review and respond.`,
        data: { 
          nomineeId,
          nomineeEmail: nominee.email,
          requestedSections: [], // Empty array since this is just a request to be a nominee
          status: "pending"
        },
        read: false,
        created_at: new Date().toISOString(),
      };

      console.log("Creating nominee notification:", nomineeNotification);

      const { data: nomineeNotifData, error: nomineeNotifError } = await supabase
        .from("notifications")
        .insert(nomineeNotification)
        .select()
        .single();

      if (nomineeNotifError) {
        console.error("Error creating nominee notification:", nomineeNotifError);
      } else {
        console.log("Nominee notification created:", nomineeNotifData);
      }

      // Also notify the trustee (user who sent the request)
      const trusteeNotification = {
        user_id: nominee.user_id,
        type: "nominee_request_sent",
        title: "Nominee Request Sent",
        message: `A request has been sent to ${nominee.name} (${nominee.email}) to be a nominee.`,
        data: { 
          nomineeId,
          nomineeEmail: nominee.email,
          nomineeName: nominee.name,
          status: "pending"
        },
        read: false,
        created_at: new Date().toISOString(),
      };

      console.log("Creating trustee notification:", trusteeNotification);

      const { data: trusteeNotifData, error: trusteeNotifError } = await supabase
        .from("notifications")
        .insert(trusteeNotification)
        .select()
        .single();

      if (trusteeNotifError) {
        console.error("Error creating trustee notification:", trusteeNotifError);
      } else {
        console.log("Trustee notification created:", trusteeNotifData);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in send-nominee-request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 