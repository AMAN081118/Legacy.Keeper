import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)

    // Get all roles
    const { data: allRoles, error: allRolesError } = await supabase
      .from('roles')
      .select('*')

    // Get users table data for related users
    const relatedUserIds = userRoles?.map(ur => ur.related_user_id).filter(Boolean) || []
    let relatedUsers = []
    if (relatedUserIds.length > 0) {
      const { data: relatedUsersData, error: relatedUsersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', relatedUserIds)
      
      relatedUsers = relatedUsersData || []
    }

    // Get trustees where user is the trustee
    const { data: trusteeData, error: trusteeError } = await supabase
      .from('trustees')
      .select('*')
      .eq('email', user.email)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      },
      userRoles: userRoles || [],
      allRoles: allRoles || [],
      relatedUsers: relatedUsers,
      trusteeData: trusteeData || [],
      errors: {
        userRolesError,
        allRolesError,
        trusteeError
      }
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
