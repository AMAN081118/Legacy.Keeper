import { Suspense } from "react"
import { getHealthRecords } from "@/app/actions/health-records"
import { HealthRecordsHeader } from "@/components/health-records/health-records-header"
import { HealthRecordsTable } from "@/components/health-records/health-records-table"
import { EmptyState } from "@/components/health-records/empty-state"
import { cookies } from "next/headers"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function HealthRecordsPage() {
  const cookieStore = await cookies()
  let currentRole = null
  try {
    currentRole = await getCurrentRoleFromSession()
  } catch (error) {
    console.error("Error getting current role:", error)
  }

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Family' access ---
  if (
    currentRole?.name === "nominee" &&
    (!currentRole.accessCategories || !currentRole.accessCategories.includes("Family"))
  ) {
    redirect("/dashboard")
  }
  // -----------------------------------------------------------------------------

  const { success, data: healthRecords } = await getHealthRecords()

  return (
    <div className="flex flex-col h-full">
      <HealthRecordsHeader recordCount={healthRecords?.length || 0} />
      <div className="flex-1 p-4 md:p-6">
        <Suspense fallback={<div>Loading...</div>}>
          {success && healthRecords && healthRecords.length > 0 ? (
            <HealthRecordsTable healthRecords={healthRecords} />
          ) : (
            <EmptyState />
          )}
        </Suspense>
      </div>
    </div>
  )
}
