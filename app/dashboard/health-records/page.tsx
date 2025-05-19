import { Suspense } from "react"
import { getHealthRecords } from "@/app/actions/health-records"
import { HealthRecordsHeader } from "@/components/health-records/health-records-header"
import { HealthRecordsTable } from "@/components/health-records/health-records-table"
import { EmptyState } from "@/components/health-records/empty-state"

export const dynamic = "force-dynamic"

export default async function HealthRecordsPage() {
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
