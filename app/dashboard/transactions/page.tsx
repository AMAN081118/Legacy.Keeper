import { createServerClient } from "@/lib/supabase/server"
import { TransactionsHeader } from "@/components/transactions/transactions-header"
import { TransactionsTabs } from "@/components/transactions/transactions-tabs"
import { redirect } from "next/navigation"
import { getTransactionsForRole } from "@/app/actions/transactions"
import { cookies } from "next/headers"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"

export default async function TransactionsPage() {
  const supabase = createServerClient()
  const cookieStore = await cookies()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  // Get current role from session (if available)
  let currentRole = null
  try {
    currentRole = await getCurrentRoleFromSession(cookieStore)
  } catch {}

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Finance' access ---
  if (
    currentRole?.name === "nominee" &&
    (!currentRole.accessCategories || !currentRole.accessCategories.includes("Finance"))
  ) {
    redirect("/dashboard")
  }
  // -----------------------------------------------------------------------------

  // Get transactions data for the correct user (nominee or not)
  const transactionsData = await getTransactionsForRole(session.user.id, currentRole || { name: "user" })

  return (
    <div className="space-y-6">
      <TransactionsHeader userData={userData} />
      <TransactionsTabs transactionsData={transactionsData || []} />
    </div>
  )
}
