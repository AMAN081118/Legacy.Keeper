"use client"

import { useState } from "react"
import type { Reminder } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Trash2, Pencil, Download } from "lucide-react"
import { AddReminderModal } from "./add-reminder-modal"
import { EditReminderModal } from "./edit-reminder-modal"
import { DeleteReminderModal } from "./delete-reminder-modal"
import { ViewReminderModal } from "./view-reminder-modal"
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

  // Convert reminders to CSV format
  const convertToCSV = (data: Reminder[]) => {
    const headers = ["Reminder Name", "Category", "Start Date", "Frequency", "Notes"]
    const rows = data.map((reminder) => [
      reminder.reminder_name,
      reminder.category || "",
      formatDate(reminder.start_date),
      `${reminder.frequency} days`,
      reminder.notes || "",
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    return csvContent
  }

  // Handle CSV download
  const handleDownloadCSV = () => {
    const csvContent = convertToCSV(filteredReminders)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `reminders_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
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
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setReminderToView(reminder)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setReminderToEdit(reminder)}>
                          <Pencil className="h-4 w-4" />
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
                  <td colSpan={5} className="h-24 text-center">
                    No reminders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center border-t px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="First page"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="19 12 5 12" /><polyline points="12 19 5 12 12 5" /></svg>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Previous page"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-full text-sm ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Next page"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Last page"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="5 12 19 12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>
        </div>
      )}

      {reminderToEdit && (
        <EditReminderModal
          reminder={reminderToEdit}
          onClose={() => setReminderToEdit(null)}
          onUpdate={handleReminderUpdated}
        />
      )}

      {reminderToView && (
        <ViewReminderModal
          reminder={reminderToView}
          onClose={() => setReminderToView(null)}
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
