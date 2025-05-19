import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { userId, userData } = requestData

    // Create a Supabase client with admin privileges
    const supabase = createAdminClient()

    // Insert the user data
    const { error } = await supabase.from("users").insert({
      id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      dob: userData.dob,
      gender: userData.gender,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
