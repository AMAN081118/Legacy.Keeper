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
      government_id_url: userData.government_id_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Assign default 'user' role
    try {
      const { data: userRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "user")
        .single()

      if (userRole) {
        await supabase.from("user_roles").insert({
          user_id: userId,
          role_id: userRole.id,
          created_at: new Date().toISOString(),
        })
      }
    } catch (roleError) {
      console.warn("Warning: Could not assign default role:", roleError)
      // Don't fail the registration if role assignment fails
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
