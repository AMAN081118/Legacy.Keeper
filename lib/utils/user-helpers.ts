import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"

export async function getUserProfile(): Promise<Tables<"users"> | null> {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get the user profile
  const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error || !data) return null

  return data
}

export async function updateUserProfile(updates: Partial<Tables<"users">>): Promise<boolean> {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // Update the user profile
  const { error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  return !error
}
