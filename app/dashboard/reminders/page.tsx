import { Suspense } from "react"
import { RemindersHeader } from "@/components/reminders/reminders-header"
import { RemindersClient } from "@/components/reminders/reminders-client"

export const dynamic = 'force-dynamic'

export default function RemindersPage() {
  return (
    <div className="flex flex-col gap-6">
      <RemindersHeader />
      <Suspense fallback={<div>Loading reminders...</div>}>
        <RemindersClient />
      </Suspense>
    </div>
  )
}
