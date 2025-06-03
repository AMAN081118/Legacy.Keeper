"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Reminder } from "@/lib/supabase/database.types"
import { formatDate } from "@/lib/utils"
import { FileText } from "lucide-react"

interface ViewReminderModalProps {
  reminder: Reminder
  onClose: () => void
}

export function ViewReminderModal({ reminder, onClose }: ViewReminderModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>View Reminder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label>Reminder Name</Label>
              <div className="text-sm">{reminder.reminder_name}</div>
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <div className="text-sm">{reminder.category}</div>
            </div>

            <div className="grid gap-2">
              <Label>Start Date</Label>
              <div className="text-sm">{formatDate(reminder.start_date)}</div>
            </div>

            <div className="grid gap-2">
              <Label>Frequency</Label>
              <div className="text-sm">{reminder.frequency} days</div>
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <div className="text-sm whitespace-pre-wrap">{reminder.notes || "No notes"}</div>
            </div>

            <div className="grid gap-2">
              <Label>Attachment</Label>
              <div className="text-sm">
                {reminder.attachment_url ? (
                  <a
                    href={reminder.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Attachment
                  </a>
                ) : (
                  <span className="text-muted-foreground">No file attached</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 