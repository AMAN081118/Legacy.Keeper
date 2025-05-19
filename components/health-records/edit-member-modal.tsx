"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/file-upload"
import { updateHealthRecord } from "@/app/actions/health-records"
import { useToast } from "@/components/ui/use-toast"
import type { HealthRecord } from "@/lib/supabase/database.types"
import { format } from "date-fns"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

interface EditMemberModalProps {
  record: HealthRecord
  open: boolean
  onClose: () => void
}

export function EditMemberModal({ record, open, onClose }: EditMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentUrl, setAttachmentUrl] = useState(record.attachment_url || "")
  const [bucketReady, setBucketReady] = useState(false)
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

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      return format(new Date(dateString), "yyyy-MM-dd")
    } catch (error) {
      return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      if (attachmentUrl) {
        formData.append("attachmentUrl", attachmentUrl)
      }

      const result = await updateHealthRecord(record.id, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Health record updated successfully",
        })
        onClose()
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update health record",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating health record:", error)
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">Member Name</Label>
              <Input id="memberName" name="memberName" defaultValue={record.member_name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">DOB</Label>
              <Input id="dob" name="dob" type="date" defaultValue={formatDateForInput(record.dob)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" defaultValue={record.gender || ""}>
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
              <Select name="bloodGroup" defaultValue={record.blood_group || ""}>
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
            <Input id="contactNumber" name="contactNumber" type="tel" defaultValue={record.contact_number || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input id="emergencyContact" name="emergencyContact" defaultValue={record.emergency_contact || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Medical Conditions</Label>
            <Textarea
              id="medicalConditions"
              name="medicalConditions"
              rows={3}
              defaultValue={record.medical_conditions || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea id="allergies" name="allergies" rows={2} defaultValue={record.allergies || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medications</Label>
            <Textarea id="medications" name="medications" rows={2} defaultValue={record.medications || ""} />
          </div>

          <div className="space-y-2">
            <Label>Medical Records</Label>
            {record.attachment_url && (
              <div className="mb-2 text-sm text-blue-600">
                <a href={record.attachment_url} target="_blank" rel="noopener noreferrer">
                  View current document
                </a>
              </div>
            )}
            <FileUpload bucket="user_documents" onUploadComplete={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
            {!bucketReady && (
              <p className="text-xs text-red-500 mt-1">Storage not available. File uploads may not work.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0a2642] text-white hover:bg-[#0a2642]/90" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
