"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export async function logoutUser() {
  const supabase = createServerClient()

  // Sign out the user
  await supabase.auth.signOut()

  // Clear all session-related cookies
  const cookieStore = await cookies()
  cookieStore.delete("supabase-auth-token")
  cookieStore.delete(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split(".")[0]?.split("//")[1]}-auth-token`)
  cookieStore.delete("currentRole") // Clear role cookie
  cookieStore.delete("currentRoleUser") // Clear role user cookie

  // Redirect to registration page
  redirect("/")
}
