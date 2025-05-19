"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { addHealthCondition } from "@/app/actions/health-conditions"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddHealthConditionModalProps {
  healthRecordId: string
}

export function AddHealthConditionModal({ healthRecordId }: AddHealthConditionModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [conditionName, setConditionName] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addHealthCondition({
        healthRecordId,
        conditionName,
        doctorName,
        visitDate: visitDate ? format(visitDate, "yyyy-MM-dd") : null,
        description,
        attachmentUrl,
      })

      toast({
        title: "Health condition added",
        description: "The health condition has been added successfully.",
      })

      // Reset form and close modal
      setConditionName("")
      setDoctorName("")
      setVisitDate(undefined)
      setDescription("")
      setAttachmentUrl(null)
      setOpen(false)

      // Refresh the page to show the new condition
      window.location.reload()
    } catch (error) {
      console.error("Error adding health condition:", error)
      toast({
        title: "Error",
        description: "Failed to add health condition. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#0a2642] hover:bg-[#0a2642]/90 text-white">
        <Plus className="h-4 w-4 mr-2" /> Add New Health Condition
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Health Condition</DialogTitle>
            <DialogDescription>Add a new health condition for this family member.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditionName">Condition Name *</Label>
              <Input
                id="conditionName"
                value={conditionName}
                onChange={(e) => setConditionName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input id="doctorName" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitDate">Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !visitDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {visitDate ? format(visitDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={visitDate} onSelect={setVisitDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Attachment</Label>
              <FileUpload endpoint="healthConditionAttachment" value={attachmentUrl} onChange={setAttachmentUrl} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Condition"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
