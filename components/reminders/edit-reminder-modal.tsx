"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateReminder } from "@/app/actions/reminders"
import { FileUpload } from "@/components/file-upload"
import { useToast } from "@/components/ui/use-toast"
import type { Reminder } from "@/lib/supabase/database.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"

interface EditReminderModalProps {
  reminder: Reminder
  onClose: () => void
  onUpdate: (reminder: Reminder) => void
}

export function EditReminderModal({ reminder, onClose, onUpdate }: EditReminderModalProps) {
  const [open, setOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("id", reminder.id)
      formData.append("currentAttachmentUrl", reminder.attachment_url || "")

      const result = await updateReminder(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Reminder updated successfully",
        })

        // Create an updated reminder object
        const updatedReminder: Reminder = {
          ...reminder,
          reminder_name: formData.get("reminderName") as string,
          category: formData.get("category") as string,
          start_date: formData.get("startDate") as string,
          frequency: Number.parseInt(formData.get("frequency") as string) || null,
          notes: formData.get("notes") as string,
          // We don't know the new attachment URL here, but the UI will refresh
          updated_at: new Date().toISOString(),
        }

        onUpdate(updatedReminder)
        handleClose()
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update reminder",
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
      setIsSubmitting(false)
    }
  }

  const categories = [
    "Insurance",
    "Debts and Loans",
    "Deposits and Investments",
    "Health",
    "Family",
    "Business",
    "Other",
  ]

  const frequencies = [
    { value: "10", label: "10 days" },
    { value: "20", label: "20 days" },
    { value: "30", label: "30 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
    { value: "180", label: "180 days" },
    { value: "365", label: "365 days" },
  ]

  // Format the date for the input
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (e) {
      return new Date().toISOString().split("T")[0]
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="reminderName">Reminder Name</Label>
              <Input
                id="reminderName"
                name="reminderName"
                placeholder="Enter reminder name"
                defaultValue={reminder.reminder_name}
                required
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={reminder.category || categories[0]}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={formatDateForInput(reminder.start_date)}
                className="w-full"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency (days)</Label>
              <Select name="frequency" defaultValue={reminder.frequency?.toString() || frequencies[2].value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter notes"
                className="min-h-[100px] w-full"
                defaultValue={reminder.notes || ""}
              />
            </div>

            <div className="col-span-2 grid gap-2">
              <Label>Attachment</Label>
              <div className="space-y-2">
                {reminder.attachment_url ? (
                  <div className="text-sm">
                    Current file:
                    <a
                      href={reminder.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Attachment
                    </a>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No file attached</div>
                )}
                <div className="mt-2">
                  <FileUpload name="file" maxSize={5 * 1024 * 1024} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                  <p className="text-xs text-muted-foreground mt-1">Upload a new file to replace the current one (optional)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
