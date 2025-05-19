"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export async function logoutUser() {
  const supabase = createServerClient()

  // Sign out the user
  await supabase.auth.signOut()

  // Clear cookies (await cookies() for dynamic API)
  const cookieStore = await cookies()
  cookieStore.delete("supabase-auth-token")
  cookieStore.delete(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split(".")[0]?.split("//")[1]}-auth-token`)

  // Redirect to registration page
  redirect("/")
}
