import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      amount,
      comment,
      transaction_type,
      details,
      attachment,
      recipient_email
    } = body

    console.log("[Create Request] Incoming data:", body)

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    if (!recipient_email) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    // Get sender from session
    const cookieStore = cookies()
    const supabase = createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("[Create Request] Unauthorized: No session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const sender_id = session.user.id

    // Debug: First check if the email exists at all
    const { data: allUsers, error: allUsersError } = await supabase
      .from("users")
      .select("email")
    
    console.log("[Create Request] All users in database:", allUsers)
    console.log("[Create Request] Looking for email:", recipient_email)

    // Look up recipient by email
    const { data: recipient, error: recipientError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", recipient_email.trim())
      .maybeSingle()

    console.log("[Create Request] Recipient lookup result:", { recipient, recipientError })

    if (recipientError) {
      console.error("[Create Request] Recipient lookup error:", recipientError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!recipient) {
      console.error("[Create Request] Recipient not found:", recipient_email)
      return NextResponse.json({ 
        error: "Recipient not found", 
        message: "The email address you entered is not registered in our system. Please check the email address and try again."
      }, { status: 404 })
    }

    // Insert request with validated amount
    const { error: insertError } = await supabase.from("requests").insert({
      user_id: sender_id,
      recipient_id: recipient.id,
      title,
      amount: Number(amount), // Convert to number
      comment: comment || null,
      status: "pending",
      transaction_type,
      details: details || null,
      attachment: attachment || null,
      date: new Date().toISOString().slice(0, 10),
    })
    if (insertError) {
      console.error("[Create Request] Insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    console.log("[Create Request] Success")
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[Create Request] Server error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 