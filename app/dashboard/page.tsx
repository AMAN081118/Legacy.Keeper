import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { FinancialChart } from "@/components/dashboard/financial-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get current role from session (if available)
  let currentRole = null
  try {
    currentRole = await getCurrentRoleFromSession()
  } catch {}

  // Get user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  // Get requests data
  const { data: requestsData } = await supabase
    .from("requests")
    .select("*")
    .or(`user_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)

  // Get trustees data
  const { data: trusteesData } = await supabase.from("trustees").select("*").eq("user_id", session.user.id)

  // Get nominees data
  const { data: nomineesData } = await supabase.from("nominees").select("*").eq("user_id", session.user.id)

  // Get transactions data
  const { data: transactionsData } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("date", { ascending: false })
    .limit(5)

  // Get reminders data
  const { data: remindersData } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("start_date", { ascending: false })
    .limit(5)

  // Calculate summary data
  const pendingRequests = requestsData?.filter((req) => req.status === "pending").length || 0
  const trusteesCount = trusteesData?.length || 0
  const nomineesCount = nomineesData?.length || 0

  const summaryData = {
    requests: pendingRequests,
    trustees: trusteesCount,
    nominees: nomineesCount,
  }

  return (
    <div className="space-y-6">
      <DashboardHeader userData={userData} />
      <SummaryCards summaryData={summaryData} />

      <div className="rounded-lg border bg-white p-6">
        <FinancialChart transactionsData={transactionsData || []} />
      </div>

      <div className="rounded-lg border bg-white">
        <Tabs defaultValue="transactions">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <TabsList>
              <TabsTrigger value="transactions">Recent Transactions ({transactionsData?.length || 0})</TabsTrigger>
              <TabsTrigger value="reminders">Reminders ({remindersData?.length || 0})</TabsTrigger>
            </TabsList>
            <div className="flex space-x-4">
              <Link href="/dashboard/transactions" className="text-sm text-blue-600 hover:underline">
                See all transactions
              </Link>
              <Link href="/dashboard/reminders" className="text-sm text-blue-600 hover:underline">
                See all reminders
              </Link>
            </div>
          </div>
          <TabsContent value="transactions" className="p-0">
            <TransactionsTable transactions={transactionsData || []} />
          </TabsContent>
          <TabsContent value="reminders" className="p-6">
            {remindersData && remindersData.length > 0 ? (
              <div className="space-y-4">
                {remindersData.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">{reminder.reminder_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(reminder.start_date).toLocaleDateString()} • {reminder.category}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">Every {reminder.frequency} days</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Your upcoming reminders will appear here.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
