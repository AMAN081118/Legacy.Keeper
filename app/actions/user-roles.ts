import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

export async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = createServerClient()
  // Join user_roles and roles to get role names
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user roles:', error)
    return []
  }

  // Return role names
  return (data || []).map((item: any) => item.roles?.name).filter(Boolean)
}

export async function getCurrentRoleFromSession() {
  try {
    const cookieStore = await cookies()
    const currentRoleCookie = await cookieStore.get('currentRole')
    console.log('[Debug] Current role cookie:', currentRoleCookie?.value)
    
    if (!currentRoleCookie?.value) {
      console.log('[Debug] No role cookie found, defaulting to null')
      return null
    }
    
    const role = JSON.parse(decodeURIComponent(currentRoleCookie.value))
    console.log('[Debug] Parsed role from cookie:', role)
    return role
  } catch (error) {
    console.error('[Debug] Error reading role from session:', error)
    return null
  }
}
