import { getBusinessPlans } from "@/app/actions/business-plans"
import { BusinessPlansHeader } from "@/components/business-plans/business-plans-header"
import { BusinessPlansTable } from "@/components/business-plans/business-plans-table"
import { setupStorage } from "@/app/actions/storage"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"
import { redirect } from "next/navigation"

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export default async function BusinessPlansPage() {
  // Ensure storage bucket exists
  await setupStorage()

  const supabase = createServerClient()
  const cookieStore = await cookies()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/")
  }
  let currentRole = null
  try {
    currentRole = await getCurrentRoleFromSession()
  } catch (error) {
    console.error("Error getting current role:", error)
  }

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Financial Planning' access ---
  if (
    currentRole?.name === "nominee" &&
    (!currentRole.accessCategories || !currentRole.accessCategories.includes("Financial Planning"))
  ) {
    redirect("/dashboard")
  }
  // -----------------------------------------------------------------------------

  const { data: businessPlans, error } = await getBusinessPlans(session.user.id, currentRole || { name: "user" })

  return (
    <div className="flex flex-col gap-6 p-6">
      <BusinessPlansHeader />
      <BusinessPlansTable businessPlans={businessPlans || []} error={error} />
    </div>
  )
}
