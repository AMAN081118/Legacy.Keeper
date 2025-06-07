// Mark this route as dynamic
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, title, amount, comment, transactionType, details, attachment, email } = body
    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }
    const supabase = createServerClient()
    // Optionally: check if user is sender
    const { error } = await supabase
      .from("requests")
      .update({
        title,
        amount: Number(amount),
        comment,
        transaction_type: transactionType,
        details,
        attachment,
      })
      .eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 