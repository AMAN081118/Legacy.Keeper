import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")
    if (!userEmail) {
      return NextResponse.json({ error: "Missing userEmail parameter" }, { status: 400 })
    }
    const supabase = createAdminClient()
    // Find user by email
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", userEmail).single()
    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    // Fetch nominees for this user
    const { data: nominees, error: nomineesError } = await supabase.from("nominees").select("*").eq("user_id", user.id)
    if (nomineesError) {
      return NextResponse.json({ error: "Failed to fetch nominees" }, { status: 500 })
    }
    return NextResponse.json({ nominees })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 