import type { Metadata } from "next"
import { TrusteesClient } from "@/components/trustees/trustees-client"
import { createServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Trustees | Legacy Keeper",
  description: "Manage your trustees",
}

export default async function TrusteesPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to view this page.</div>
  }

  // Fetch trustees
  const { data: trustees, error } = await supabase
    .from("trustees")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trustees:", error)
    return <div>Error loading trustees. Please try again later.</div>
  }

  return <TrusteesClient initialTrustees={trustees || []} />
}
