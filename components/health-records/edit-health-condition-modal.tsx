"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateHealthCondition } from "@/app/actions/health-conditions"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditHealthConditionModalProps {
  condition: {
    id: string
    health_record_id: string
    condition_name: string
    doctor_name: string | null
    visit_date: string | null
    description: string | null
    attachment_url: string | null
  }
  trigger?: React.ReactNode
}

export function EditHealthConditionModal({ condition, trigger }: EditHealthConditionModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conditionName, setConditionName] = useState(condition.condition_name)
  const [doctorName, setDoctorName] = useState(condition.doctor_name || "")
  const [visitDate, setVisitDate] = useState<Date | undefined>(
    condition.visit_date ? new Date(condition.visit_date) : undefined,
  )
  const [description, setDescription] = useState(condition.description || "")
  const [attachmentUrl, setAttachmentUrl] = useState(condition.attachment_url || "")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("id", condition.id)
      formData.append("health_record_id", condition.health_record_id)
      formData.append("condition_name", conditionName)
      formData.append("doctor_name", doctorName)
      if (visitDate) {
        formData.append("visit_date", format(visitDate, "yyyy-MM-dd"))
      }
      formData.append("description", description)
      formData.append("attachment_url", attachmentUrl)

      const result = await updateHealthCondition(formData)

      if (result.success) {
        toast({
          title: "Health condition updated",
          description: "The health condition has been updated successfully.",
        })
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update health condition",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button variant="outline">Edit Health Condition</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Health Condition</DialogTitle>
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
                  {visitDate ? format(visitDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={visitDate} onSelect={setVisitDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Attachment</Label>
            <FileUpload endpoint="healthConditionAttachment" value={attachmentUrl} onChange={setAttachmentUrl} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
