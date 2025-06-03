"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PencilIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/file-upload"
import { getInsuranceById, updateInsurance } from "@/app/actions/insurance"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Insurance } from "@/lib/supabase/database.types"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export function EditInsuranceModal({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [insurance, setInsurance] = useState<Insurance | null>(null)
  const [date, setDate] = useState<Date>()
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [bucketReady, setBucketReady] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadInsurance()

      // Check if bucket exists
      if (!bucketReady) {
        const checkBucket = async () => {
          const exists = await ensureBucketExists("insurance")
          setBucketReady(exists)
          if (!exists) {
            toast({
              title: "Storage Error",
              description: "Could not initialize storage. File uploads may not work.",
              variant: "destructive",
            })
          }
        }
        checkBucket()
      }
    }
  }, [open, bucketReady, toast])

  const loadInsurance = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await getInsuranceById(id)
      if (error || !data) {
        toast({
          title: "Error",
          description: error || "Failed to load insurance details",
          variant: "destructive",
        })
        setOpen(false)
        return
      }

      setInsurance(data)
      if (data.date) {
        setDate(new Date(data.date))
      }
      setAttachmentUrl(data.attachment_url)
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append("id", id)

    // Add the date in ISO format
    if (date) {
      formData.set("date", date.toISOString().split("T")[0])
    }

    // Add the attachment URL if available
    if (attachmentUrl) {
      formData.set("attachmentUrl", attachmentUrl)
    }

    try {
      const result = await updateInsurance(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Insurance updated successfully",
        })
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update insurance",
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

  const handleFileUpload = (url: string) => {
    setAttachmentUrl(url)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-8 w-8 text-blue-600">
        <PencilIcon className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Insurance</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : insurance ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Insurance Name</Label>
                <Input id="name" name="name" defaultValue={insurance.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceType">Insurance Type</Label>
                <Select name="insuranceType" defaultValue={insurance.insurance_type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Life">Life Insurance</SelectItem>
                    <SelectItem value="Health">Health Insurance</SelectItem>
                    <SelectItem value="Term">Term Insurance</SelectItem>
                    <SelectItem value="Auto">Auto Insurance</SelectItem>
                    <SelectItem value="Property">Property</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Insurance Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" defaultValue={insurance.amount} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coveragePeriod">Insurance Coverage Period Time</Label>
                <Select name="coveragePeriod" defaultValue={insurance.coverage_period || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="5 years">5 years</SelectItem>
                    <SelectItem value="10 years">10 years</SelectItem>
                    <SelectItem value="Lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Insurance Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={insurance.description || ""}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachment</Label>
                <div className="border rounded-md p-3">
                  {attachmentUrl ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate max-w-[300px]">{attachmentUrl.split("/").pop()}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setAttachmentUrl(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <FileUpload
                      bucket="insurance"
                      onUploadComplete={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">Failed to load insurance details</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
