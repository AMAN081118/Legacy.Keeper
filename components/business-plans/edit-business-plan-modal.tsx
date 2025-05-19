"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateBusinessPlan } from "@/app/actions/business-plans"
import { FileUpload } from "@/components/file-upload"
import { useToast } from "@/components/ui/use-toast"
import type { BusinessPlan } from "@/lib/supabase/database.types"
import { Pencil } from "lucide-react"

interface EditBusinessPlanModalProps {
  businessPlan: BusinessPlan
}

export function EditBusinessPlanModal({ businessPlan }: EditBusinessPlanModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("id", businessPlan.id)

      if (file) {
        formData.set("file", file)
      }

      const result = await updateBusinessPlan(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Business plan updated successfully",
        })
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update business plan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating business plan:", error)
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
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-8 w-8">
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Business Plan</DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="businessName" className="text-sm font-medium">
                  Business Name
                </label>
                <Input id="businessName" name="businessName" defaultValue={businessPlan.business_name} required />
              </div>

              <div className="grid gap-2">
                <label htmlFor="businessType" className="text-sm font-medium">
                  Business Type and Owner
                </label>
                <Input id="businessType" name="businessType" defaultValue={businessPlan.business_type} required />
              </div>

              <div className="grid gap-2">
                <label htmlFor="investmentAmount" className="text-sm font-medium">
                  Investment Amount
                </label>
                <Input
                  id="investmentAmount"
                  name="investmentAmount"
                  type="number"
                  defaultValue={businessPlan.investment_amount}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="ownershipPercentage" className="text-sm font-medium">
                  Ownership Percentage / Profit Split and Returns
                </label>
                <Input
                  id="ownershipPercentage"
                  name="ownershipPercentage"
                  defaultValue={businessPlan.ownership_percentage || ""}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="successionPlans" className="text-sm font-medium">
                  Succession Plans and Notes
                </label>
                <Textarea
                  id="successionPlans"
                  name="successionPlans"
                  defaultValue={businessPlan.succession_plans || ""}
                  className="h-20 resize-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Government ID</label>
                {businessPlan.attachment_url && (
                  <div className="mb-2 text-sm text-gray-500">
                    Current file:{" "}
                    <a
                      href={businessPlan.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  </div>
                )}
                <FileUpload
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
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
