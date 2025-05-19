"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteReminder } from "@/app/actions/reminders"
import { useToast } from "@/components/ui/use-toast"
import type { Reminder } from "@/lib/supabase/database.types"

interface DeleteReminderModalProps {
  reminder: Reminder
  onClose: () => void
  onDelete: (id: string) => void
}

export function DeleteReminderModal({ reminder, onClose, onDelete }: DeleteReminderModalProps) {
  const [open, setOpen] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteReminder(reminder.id)

      if (result.success) {
        toast({
          title: "Success",
          description: "Reminder deleted successfully",
        })
        onDelete(reminder.id)
        handleClose()
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Reminder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this reminder? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">{reminder.reminder_name}</p>
          {reminder.category && <p className="text-sm text-muted-foreground">Category: {reminder.category}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
