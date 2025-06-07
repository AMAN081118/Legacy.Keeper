// Mark this route as dynamic
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  console.log("[Update Status] API route hit")
  try {
    // Log request headers and cookies for debugging
    console.log("[Update Status] Request headers:", Object.fromEntries(req.headers.entries()))
    console.log("[Update Status] Request cookies:", req.cookies.toString())

    const body = await req.json()
    const { request_id, status } = body
    console.log("[Update Status] Incoming payload:", body)

    if (!request_id || !["pending", "approved", "rejected"].includes(status)) {
      console.error("[Update Status] Invalid input", { request_id, status })
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get current user session for debugging
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error("[Update Status] Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error" }, { status: 401 })
    }
    console.log("[Update Status] Current user session:", session?.user?.id)

    // First, fetch the request to verify it exists and log its current state
    const { data: existingRequest, error: fetchError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", request_id)
      .single()

    if (fetchError) {
      console.error("[Update Status] Error fetching request:", fetchError)
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    console.log("[Update Status] Current request state:", existingRequest)

    // Verify if the current user is the recipient
    if (existingRequest.recipient_id !== session?.user?.id) {
      console.error("[Update Status] Unauthorized: User is not the recipient", {
        userId: session?.user?.id,
        recipientId: existingRequest.recipient_id
      })
      return NextResponse.json({ error: "Unauthorized: Only the recipient can update the status" }, { status: 403 })
    }

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", request_id)
      .select()
      .single()

    if (updateError) {
      console.error("[Update Status] DB error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log("[Update Status] Success - Updated request:", updatedRequest)
    return NextResponse.json({ success: true, data: updatedRequest })
  } catch (e) {
    console.error("[Update Status] Unexpected server error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 