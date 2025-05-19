"use client"

import { useState } from "react"
import type { Reminder } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Trash2 } from "lucide-react"
import { AddReminderModal } from "./add-reminder-modal"
import { EditReminderModal } from "./edit-reminder-modal"
import { DeleteReminderModal } from "./delete-reminder-modal"
import { Pagination } from "@/components/ui/pagination"
import { formatDate } from "@/lib/utils"

interface RemindersTableProps {
  initialReminders: Reminder[]
}

export function RemindersTable({ initialReminders }: RemindersTableProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null)
  const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null)
  const [reminderToView, setReminderToView] = useState<Reminder | null>(null)

  const itemsPerPage = 5

  // Filter reminders based on search term
  const filteredReminders = reminders.filter(
    (reminder) =>
      reminder.reminder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reminder.category && reminder.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reminder.notes && reminder.notes.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Paginate reminders
  const totalPages = Math.ceil(filteredReminders.length / itemsPerPage)
  const paginatedReminders = filteredReminders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle reminder updates
  const handleReminderUpdated = (updatedReminder: Reminder) => {
    setReminders((prev) => prev.map((r) => (r.id === updatedReminder.id ? updatedReminder : r)))
  }

  // Handle reminder deletion
  const handleReminderDeleted = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search reminders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Download
          </Button>
          <AddReminderModal />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reminder name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Frequency</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Notes</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {paginatedReminders.length > 0 ? (
                paginatedReminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">{reminder.reminder_name}</td>
                    <td className="p-4 align-middle">{reminder.category}</td>
                    <td className="p-4 align-middle">{formatDate(reminder.start_date)}</td>
                    <td className="p-4 align-middle">{reminder.frequency} days</td>
                    <td className="p-4 align-middle max-w-[200px] truncate">{reminder.notes}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setReminderToEdit(reminder)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setReminderToDelete(reminder)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    No reminders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{itemsPerPage} Items per page</div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </Pagination>
      )}

      {reminderToEdit && (
        <EditReminderModal
          reminder={reminderToEdit}
          onClose={() => setReminderToEdit(null)}
          onUpdate={handleReminderUpdated}
        />
      )}

      {reminderToDelete && (
        <DeleteReminderModal
          reminder={reminderToDelete}
          onClose={() => setReminderToDelete(null)}
          onDelete={handleReminderDeleted}
        />
      )}
    </div>
  )
}
