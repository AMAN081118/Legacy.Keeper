import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { FinancialChart } from "@/components/dashboard/financial-chart"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import TrusteeRequests from "@/components/dashboard/trustee-requests"
import { cookies } from "next/headers"
import PermissionRequiredClientWrapper from "@/components/dashboard/permission-required-client-wrapper"

// Separate components for parallel loading
async function DashboardData({ userId }: { userId: string }) {
  let debugInfo = "";
  try {
    const supabase = createServerClient();
    const cookieStore = await cookies();

    // Get current role from session
    let currentRole = null;
    try {
      currentRole = await getCurrentRoleFromSession(cookieStore);
    } catch (err) {
      debugInfo += `Error getting currentRole: ${err}\n`;
    }

    debugInfo += `CurrentRole: ${JSON.stringify(currentRole)}\n`;

    // If user is a nominee, show permission required UI
    if (currentRole?.name === "nominee") {
      // Full list of possible sections
      const allSections = ["Family", "Finance", "Financial Planning"];
      // Get the categories the user has access to (default to empty array if undefined)
      const userAccess = Array.isArray(currentRole.accessCategories) ? currentRole.accessCategories : [];
      // Find which sections are missing
      const missingSections = allSections.filter(section => !userAccess.includes(section));

      return (
        <PermissionRequiredClientWrapper
          missingSections={missingSections}
          nomineeEmail={currentRole.user?.email}
          nomineeName={currentRole.user?.name}
        />
      );
    }

    // If user is a trustee, only show welcome text and trustee requests
    if (currentRole?.name === "trustee") {
      debugInfo += "Rendering trustee branch.\n";
      // Fetch the current user's data (the trustee)
      let trusteeData = null;
      const { data: trustee, error: trusteeError } = await supabase.from("users").select("*").eq("id", userId).single();
      if (!trusteeError && trustee) {
        trusteeData = trustee;
      }
      return (
        <>
          <DashboardHeader userData={trusteeData} />
          <TrusteeRequests />
        </>
      );
    }

    debugInfo += "Rendering user/other role branch.\n";
    // For other roles, show full dashboard
    // Parallel data fetching for better performance
    const [
      { data: userData },
      { data: requestsData },
      { data: trusteesData },
      { data: nomineesData },
      { data: transactionsData },
      { data: remindersData }
    ] = await Promise.all([
      supabase.from("users").select("*").eq("id", userId).single(),
      supabase.from("requests").select("*").eq("recipient_id", userId),
      supabase.from("trustees").select("*").eq("user_id", userId),
      supabase.from("nominees").select("*").eq("user_id", userId),
      supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(5),
      supabase.from("reminders").select("*").eq("user_id", userId).order("start_date", { ascending: false }).limit(5)
    ]);

    // Calculate summary data
    const pendingRequests = requestsData?.filter((req) => req.status === "pending").length || 0;
    const trusteesCount = trusteesData?.length || 0;
    const nomineesCount = nomineesData?.length || 0;

    const summaryData = {
      requests: pendingRequests,
      trustees: trusteesCount,
      nominees: nomineesCount,
    };

    return (
      <>
        <DashboardHeader userData={userData} />
        <SummaryCards summaryData={summaryData} />

        <div className="rounded-lg border bg-white p-6">
          <FinancialChart transactionsData={transactionsData || []} />
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="reminders">Upcoming Reminders</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="space-y-4">
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                <Link
                  href="/dashboard/transactions"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all
                </Link>
              </div>
              <TransactionsTable transactions={transactionsData || []} />
            </div>
          </TabsContent>
          <TabsContent value="reminders" className="space-y-4">
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="text-lg font-medium">Upcoming Reminders</h3>
                <Link
                  href="/dashboard/reminders"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all
                </Link>
              </div>
              <div className="p-4">
                {remindersData && remindersData.length > 0 ? (
                  <div className="space-y-3">
                    {remindersData.map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{reminder.reminder_name}</p>
                          <p className="text-sm text-gray-500">{reminder.category}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(reminder.start_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No upcoming reminders</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  } catch (err) {
    return (
      <div className="p-8 text-red-600">
        Error loading dashboard: {err instanceof Error ? err.message : String(err)}
      </div>
    );
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>

      <Skeleton className="h-96 w-full" />

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData userId={session.user.id} />
      </Suspense>
    </div>
  )
}
