import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"

/**
 * API endpoint to fix missing user profiles for existing users
 * This is a one-time fix for users who registered before the profile creation was properly implemented
 */
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await adminClient
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking user profile:", checkError)
      return NextResponse.json({ error: "Failed to check user profile" }, { status: 500 })
    }

    // If profile already exists, return success
    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: "User profile already exists",
        profileCreated: false 
      })
    }

    // Create user profile from auth metadata
    const { error: createError } = await adminClient.from("users").insert({
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      phone: user.user_metadata?.phone || null,
      dob: user.user_metadata?.dob || null,
      gender: user.user_metadata?.gender || null,
      government_id_url: user.user_metadata?.government_id_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (createError) {
      console.error("Error creating user profile:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Assign default 'user' role if it doesn't exist
    try {
      const { data: userRole } = await adminClient
        .from("roles")
        .select("id")
        .eq("name", "user")
        .single()

      if (userRole) {
        // Check if role already assigned
        const { data: existingRole } = await adminClient
          .from("user_roles")
          .select("id")
          .eq("user_id", user.id)
          .eq("role_id", userRole.id)
          .single()

        if (!existingRole) {
          await adminClient.from("user_roles").insert({
            user_id: user.id,
            role_id: userRole.id,
            created_at: new Date().toISOString(),
          })
        }
      }
    } catch (roleError) {
      console.warn("Warning: Could not assign default role:", roleError)
      // Don't fail the profile creation if role assignment fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "User profile created successfully",
      profileCreated: true 
    })

  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
