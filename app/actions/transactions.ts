import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function getTransactionsForRole(sessionUserId: string, currentRole: { name: string, relatedUser?: { email: string | null } | null }) {
  const supabase = createServerClient()
  let userId = sessionUserId

  if (currentRole?.name === "nominee" && currentRole.relatedUser?.email) {
    // Look up the related user's id by email
    const { data: user } = await supabase.from("users").select("id").eq("email", currentRole.relatedUser.email).single()
    if (user?.id) userId = user.id
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (error) throw error
  return transactions || []
}
