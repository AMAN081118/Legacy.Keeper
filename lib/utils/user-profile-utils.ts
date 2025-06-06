import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"

interface Role {
  name: string;
}

interface UserRole {
  roles: Role;
}

/**
 * Ensures a user profile exists in the users table
 * This function should be called before any operation that requires a user profile
 */
export async function ensureUserProfile(userId: string, userMetadata?: any) {
  try {
    const adminClient = createAdminClient()
    
    // Check if user profile already exists
    const { data: existingUser, error: checkError } = await adminClient
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if user doesn't exist
      console.error("Error checking user profile:", checkError)
      throw new Error("Failed to check user profile")
    }

    // If user already exists, return success
    if (existingUser) {
      return { success: true, created: false }
    }

    // Get user data from auth if metadata not provided
    let userData = userMetadata
    if (!userData) {
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId)
      if (authError || !authUser.user) {
        throw new Error("User not found in auth system")
      }
      userData = authUser.user
    }

    // Create user profile
    const { error: createError } = await adminClient
      .from("users")
      .insert({
        id: userId,
        name: userData.user_metadata?.name || userData.email?.split('@')[0] || 'User',
        email: userData.email || '',
        phone: userData.user_metadata?.phone || null,
        dob: userData.user_metadata?.dob || null,
        gender: userData.user_metadata?.gender || null,
        government_id_url: userData.user_metadata?.government_id_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (createError) {
      console.error("Error creating user profile:", createError)
      throw new Error("Failed to create user profile")
    }

    // Assign default user role
    await assignDefaultRole(userId)

    return { success: true, created: true }
  } catch (error) {
    console.error("Error in ensureUserProfile:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

/**
 * Assigns the default 'user' role to a user
 */
async function assignDefaultRole(userId: string) {
  try {
    const adminClient = createAdminClient()
    
    // Get the 'user' role ID
    const { data: userRole, error: roleError } = await adminClient
      .from("roles")
      .select("id")
      .eq("name", "user")
      .single()

    if (roleError || !userRole) {
      console.warn("Default 'user' role not found, skipping role assignment")
      return
    }

    // Check if user already has this role
    const { data: existingRole, error: checkRoleError } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role_id", userRole.id)
      .single()

    if (checkRoleError && checkRoleError.code !== 'PGRST116') {
      console.error("Error checking user role:", checkRoleError)
      return
    }

    // If role already assigned, skip
    if (existingRole) {
      return
    }

    // Assign the role
    const { error: assignError } = await adminClient
      .from("user_roles")
      .insert({
        user_id: userId,
        role_id: userRole.id,
        created_at: new Date().toISOString(),
      })

    if (assignError) {
      console.error("Error assigning default role:", assignError)
    }
  } catch (error) {
    console.error("Error in assignDefaultRole:", error)
  }
}

/**
 * Validates that a user exists and has proper profile setup
 */
export async function validateUserSetup(userId: string) {
  try {
    const supabase = createServerClient()
    
    // Check auth user
    const { data: authUser, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser.user || authUser.user.id !== userId) {
      return { valid: false, error: "Invalid authentication" }
    }

    // Check profile exists
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return { valid: false, error: "User profile not found" }
    }

    // Check role assignment
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("roles:role_id(name)")
      .eq("user_id", userId)

    if (rolesError) {
      return { valid: false, error: "Error checking user roles" }
    }

    return { 
      valid: true, 
      profile, 
      roles: roles?.map(r => {
        const role = r.roles as unknown as Role;
        return role?.name || '';
      }).filter(Boolean) || []
    }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

/**
 * Fixes common user setup issues
 */
export async function fixUserSetup(userId: string) {
  try {
    // Ensure profile exists
    const profileResult = await ensureUserProfile(userId)
    if (!profileResult.success) {
      return { success: false, error: profileResult.error }
    }

    // Validate setup
    const validation = await validateUserSetup(userId)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    return { 
      success: true, 
      message: "User setup validated and fixed",
      profileCreated: profileResult.created
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

/**
 * Middleware function to ensure user profile exists before operations
 */
export async function withUserProfile<T>(
  userId: string,
  operation: () => Promise<T>
): Promise<T> {
  const profileResult = await ensureUserProfile(userId)
  if (!profileResult.success) {
    throw new Error(`User profile setup failed: ${profileResult.error}`)
  }
  
  return await operation()
}
