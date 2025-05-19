import { Suspense } from "react"
import { getReminders } from "@/app/actions/reminders"
import { RemindersHeader } from "@/components/reminders/reminders-header"
import { RemindersTable } from "@/components/reminders/reminders-table"
import { EmptyState } from "@/components/reminders/empty-state"

export default async function RemindersPage() {
  const { reminders, error } = await getReminders()

  return (
    <div className="flex flex-col gap-6">
      <RemindersHeader />

      <Suspense fallback={<div>Loading reminders...</div>}>
        {error ? (
          <div className="p-4 text-red-500">Error loading reminders: {error}</div>
        ) : reminders && reminders.length > 0 ? (
          <RemindersTable initialReminders={reminders} />
        ) : (
          <EmptyState />
        )}
      </Suspense>
    </div>
  )
}
