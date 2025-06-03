import Image from "next/image"
import { AddReminderModal } from "./add-reminder-modal"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Image
            src="/placeholder-rpmav.png"
            alt="No reminders"
            width={200}
            height={200}
            className="rounded-md object-cover"
          />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No Reminders Found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You don&apos;t have any reminders yet. Add one to get started.
        </p>
      </div>
    </div>
  )
}
