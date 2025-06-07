import { createServerClient } from "@/lib/supabase/server"
import { DebtsLoansTabs } from "@/components/debts-loans/debts-loans-tabs"
import { createDebtsLoansBucket } from "@/app/actions/create-bucket"
import { redirect } from "next/navigation"
import DebtsLoansHeaderClient from "@/components/debts-loans/debts-loans-header-client"
import { cookies } from "next/headers"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Debts & Loans | Legacy Keeper",
  description: "Manage your debts and loans",
}

export default async function DebtsLoansPage() {
  const supabase = createServerClient()
  const cookieStore = await cookies()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get current role from session (if available)
  let currentRole = null
  try {
    currentRole = await getCurrentRoleFromSession()
  } catch (error) {
    console.error("Error getting current role:", error)
  }

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Finance' access ---
  if (
    currentRole?.name === "nominee" &&
    (!currentRole.accessCategories || !currentRole.accessCategories.includes("Finance"))
  ) {
    redirect("/dashboard")
  }
  // -----------------------------------------------------------------------------

  // Determine the correct userId to fetch data for
  let userId = user.id;
  if (currentRole?.name === "nominee" && currentRole.relatedUser?.email) {
    // Look up the related user's id by email
    const { data: relatedUser } = await supabase.from("users").select("id").eq("email", currentRole.relatedUser.email).single();
    if (relatedUser?.id) userId = relatedUser.id;
  }

  // Create the bucket if it doesn't exist
  const bucketResult = await createDebtsLoansBucket()
  console.log("Bucket creation result:", bucketResult)

  // Fetch debts and loans data for the correct user
  const { data: debtsLoans, error } = await supabase
    .from("debts_loans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching debts and loans:", error)
  }

  // Separate data by transaction type
  const moneyGiven = debtsLoans?.filter((item) => item.transaction_type === "Given") || []
  const moneyReceived = debtsLoans?.filter((item) => item.transaction_type === "Received") || []

  return (
    <div className="container mx-auto space-y-6 py-6">
      <DebtsLoansHeaderClient />
      <DebtsLoansTabs moneyGiven={moneyGiven} moneyReceived={moneyReceived} />
    </div>
  )
}
