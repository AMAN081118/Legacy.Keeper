"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/file-upload"
import { addInsurance } from "@/app/actions/insurance"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export function AddInsuranceModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [bucketReady, setBucketReady] = useState(false)
  const { toast } = useToast()

  // Check if bucket exists when modal opens
  useEffect(() => {
    if (open && !bucketReady) {
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
  }, [open, bucketReady, toast])

  const handleOpenDialog = () => {
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    // Add the date in ISO format
    if (date) {
      formData.set("date", date.toISOString().split("T")[0])
    } else {
      // Set default date to today if not selected
      formData.set("date", new Date().toISOString().split("T")[0])
    }

    // Add the attachment URL if available
    if (attachmentUrl) {
      formData.set("attachmentUrl", attachmentUrl)
    }

    try {
      const result = await addInsurance(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Insurance added successfully",
        })
        setOpen(false)
        // Reset form state
        setDate(undefined)
        setAttachmentUrl(null)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add insurance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding insurance:", error)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={handleOpenDialog}>{children}</div>
      </DialogTrigger>
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle>Add New Insurance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Insurance Name</Label>
            <Input id="name" name="name" placeholder="Health" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceType">Insurance Type</Label>
            <Select name="insuranceType" required defaultValue="Content">
              <SelectTrigger id="insuranceType">
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
            <Input id="amount" name="amount" type="number" placeholder="5000" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coveragePeriod">Insurance Coverage Period Time</Label>
            <Select name="coveragePeriod">
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
            <Label htmlFor="description">Purpose/Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter insurance description"
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Government ID</Label>
            <div className="border rounded-md p-3">
              {attachmentUrl ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm truncate max-w-[200px]">{attachmentUrl.split("/").pop()}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(attachmentUrl, "_blank")}
                    >
                      View
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAttachmentUrl(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <FileUpload bucket="insurance" onUploadComplete={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
