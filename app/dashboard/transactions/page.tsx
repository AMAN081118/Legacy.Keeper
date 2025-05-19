import { createServerClient } from "@/lib/supabase/server"
import { TransactionsHeader } from "@/components/transactions/transactions-header"
import { TransactionsTabs } from "@/components/transactions/transactions-tabs"
import { redirect } from "next/navigation"

export default async function TransactionsPage() {
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

  // Get transactions data
  const { data: transactionsData } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("date", { ascending: false })

  return (
    <div className="space-y-6">
      <TransactionsHeader userData={userData} />
      <TransactionsTabs transactionsData={transactionsData || []} />
    </div>
  )
}
