import { createServerClient } from "@/lib/supabase/server"
import { DebtsLoansHeader } from "@/components/debts-loans/debts-loans-header"
import { DebtsLoansTabs } from "@/components/debts-loans/debts-loans-tabs"
import { createDebtsLoansBucket } from "@/app/actions/create-bucket"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Debts & Loans | Legacy Keeper",
  description: "Manage your debts and loans",
}

export default async function DebtsLoansPage() {
  const supabase = createServerClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Create the bucket if it doesn't exist
  const bucketResult = await createDebtsLoansBucket()
  console.log("Bucket creation result:", bucketResult)

  // Fetch debts and loans data
  const { data: debtsLoans, error } = await supabase
    .from("debts_loans")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching debts and loans:", error)
  }

  // Separate data by transaction type
  const moneyGiven = debtsLoans?.filter((item) => item.transaction_type === "Given") || []
  const moneyReceived = debtsLoans?.filter((item) => item.transaction_type === "Received") || []

  return (
    <div className="container mx-auto space-y-6 py-6">
      <DebtsLoansHeader />
      <DebtsLoansTabs moneyGiven={moneyGiven} moneyReceived={moneyReceived} />
    </div>
  )
}
