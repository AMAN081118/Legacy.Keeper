import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import RequestsPageClient from "@/components/requests/requests-page-client"

export default async function RequestsPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  // Get requests received
  const { data: requestsReceived } = await supabase
    .from("requests")
    .select(`
      *,
      sender:user_id(name, email)
    `)
    .eq("recipient_id", session.user.id)

  // Get requests sent
  const { data: requestsSent } = await supabase
    .from("requests")
    .select(`
      *,
      recipient:recipient_id(name, email)
    `)
    .eq("user_id", session.user.id)

  return (
    <RequestsPageClient
      userData={userData}
      requestsReceived={requestsReceived || []}
      requestsSent={requestsSent || []}
    />
  )
}
