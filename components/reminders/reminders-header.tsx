import { AddReminderModal } from "./add-reminder-modal"

export function RemindersHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">View Reminder Details here!!</p>
        </div>
        <AddReminderModal />
      </div>
    </div>
  )
}
