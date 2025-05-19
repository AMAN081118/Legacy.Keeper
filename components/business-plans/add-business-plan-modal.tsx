"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addBusinessPlan } from "@/app/actions/business-plans"
import { FileUpload } from "@/components/file-upload"
import { useToast } from "@/components/ui/use-toast"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export function AddBusinessPlanModal() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      // Ensure bucket exists when opening the modal
      ensureBucketExists("user_documents").catch((error) => {
        console.error("Error ensuring bucket exists:", error)
        toast({
          title: "Storage Error",
          description: "There was an error setting up storage. File uploads may not work.",
          variant: "destructive",
        })
      })
    }
  }, [open, toast])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      if (file) {
        formData.set("file", file)
      }

      const result = await addBusinessPlan(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Business plan added successfully",
        })
        setOpen(false)
        formRef.current?.reset()
        setFile(null)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add business plan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding business plan:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile)
  }

  return (
    <>
      <div onClick={() => handleOpenChange(true)}>
        <Button className="bg-blue-900 text-white hover:bg-blue-800">+ Add New Business Plan</Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Business Plan</DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="businessName" className="text-sm font-medium">
                  Business Name
                </label>
                <Input id="businessName" name="businessName" placeholder="Enter business name" required />
              </div>

              <div className="grid gap-2">
                <label htmlFor="businessType" className="text-sm font-medium">
                  Business Type and Owner
                </label>
                <Input
                  id="businessType"
                  name="businessType"
                  placeholder="Partnership, Sole Proprietorship, etc."
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="investmentAmount" className="text-sm font-medium">
                  Investment Amount
                </label>
                <Input
                  id="investmentAmount"
                  name="investmentAmount"
                  type="number"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="ownershipPercentage" className="text-sm font-medium">
                  Ownership Percentage / Profit Split and Returns
                </label>
                <Input id="ownershipPercentage" name="ownershipPercentage" placeholder="e.g., 50%, FD, Gold" />
              </div>

              <div className="grid gap-2">
                <label htmlFor="successionPlans" className="text-sm font-medium">
                  Succession Plans and Notes
                </label>
                <Textarea
                  id="successionPlans"
                  name="successionPlans"
                  placeholder="Enter succession plans and notes"
                  className="h-20 resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Government ID</label>
                <FileUpload
                  bucket="user_documents"
                  onFileChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
