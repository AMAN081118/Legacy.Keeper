"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/file-upload"
import { createHealthRecord } from "@/app/actions/health-records"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle } from "lucide-react"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export function AddMemberModal() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [bucketReady, setBucketReady] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Ensure bucket exists when modal opens
  useEffect(() => {
    if (open) {
      const checkBucket = async () => {
        try {
          const exists = await ensureBucketExists("user_documents")
          setBucketReady(exists)
          if (!exists) {
            toast({
              title: "Storage Error",
              description: "Could not initialize file storage. File uploads may not work.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error checking bucket:", error)
          setBucketReady(false)
        }
      }
      checkBucket()
    }
  }, [open, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      if (attachmentUrl) {
        formData.append("attachmentUrl", attachmentUrl)
      }

      const result = await createHealthRecord(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Health record created successfully",
        })
        setOpen(false)
        formRef.current?.reset()
        setAttachmentUrl("")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create health record",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating health record:", error)
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
      <Button onClick={() => setOpen(true)} className="bg-[#0a2642] text-white hover:bg-[#0a2642]/90">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Member
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberName">Member Name</Label>
                <Input id="memberName" name="memberName" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">DOB</Label>
                <Input id="dob" name="dob" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender">
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select name="bloodGroup">
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" name="contactNumber" type="tel" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" name="emergencyContact" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea id="medicalConditions" name="medicalConditions" rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" name="allergies" rows={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Medications</Label>
              <Textarea id="medications" name="medications" rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Medical Records</Label>
              <FileUpload bucket="user_documents" onUploadComplete={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
              {!bucketReady && (
                <p className="text-xs text-red-500 mt-1">Storage not available. File uploads may not work.</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0a2642] text-white hover:bg-[#0a2642]/90" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
