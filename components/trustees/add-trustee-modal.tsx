"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addTrustee } from "@/app/actions/trustees"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Trustee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  profile_photo_url?: string
  government_id_url?: string
  approval_type: string
  status: string
  created_at: string
  updated_at: string
}

interface AddTrusteeModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTrustee: (trustee: Trustee) => void
}

export function AddTrusteeModal({ isOpen, onClose, onAddTrustee }: AddTrusteeModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [relationship, setRelationship] = useState("")
  const [phone, setPhone] = useState("")
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [governmentId, setGovernmentId] = useState<File | null>(null)
  const [approvalType, setApprovalType] = useState("Group Request")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!name || !email || !relationship || !phone || !approvalType) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Prevent user from adding themselves as a trustee
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        toast({
          title: "Error",
          description: "Could not verify current user.",
          variant: "destructive",
        });
        return;
      }
      if (userData?.user?.email && userData.user.email.trim().toLowerCase() === email.trim().toLowerCase()) {
        toast({
          title: "Invalid Trustee",
          description: "You cannot add yourself as a trustee.",
          variant: "destructive",
        });
        return;
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not verify current user.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("relationship", relationship)
      formData.append("phone", phone)
      formData.append("approvalType", approvalType)

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto)
      }

      if (governmentId) {
        formData.append("governmentId", governmentId)
      }

      const result = await addTrustee(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Trustee added successfully.",
      })

      onAddTrustee(result.data)
      onClose()

      // Reset form
      setName("")
      setEmail("")
      setRelationship("")
      setPhone("")
      setProfilePhoto(null)
      setGovernmentId(null)
      setApprovalType("Group Request")
    } catch (error) {
      console.error("Error adding trustee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add trustee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0])
    }
  }

  const handleGovernmentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGovernmentId(e.target.files[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Trustee</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trustee Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Id</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Enter relationship"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone No</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center justify-center rounded-md border border-dashed p-4">
                <label htmlFor="profile-photo" className="flex cursor-pointer flex-col items-center justify-center">
                  <div className="mb-2 h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                    {profilePhoto ? (
                      <img
                        src={URL.createObjectURL(profilePhoto) || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-blue-600">Upload Photo</span>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Government ID</Label>
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Drag & Drop files here</p>
                  <p className="text-xs text-gray-500">Supported format: .pdf, .jpg, .jpeg</p>
                </div>
                <div className="mt-2 flex items-center">
                  <label
                    htmlFor="governmentId"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 py-2 px-3 border border-gray-300 shadow-sm text-xs"
                  >
                    <span>Browse Files</span>
                    <input
                      id="governmentId"
                      name="governmentId"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleGovernmentIdChange}
                    />
                  </label>
                  {governmentId ? (
                    <div className="ml-2 text-xs text-gray-500">{governmentId.name}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Approval Type*</Label>
            <div className="text-xs text-gray-500">
              *Please read the Approval Type Instructions carefully before Selecting it*
            </div>
            <RadioGroup value={approvalType} onValueChange={setApprovalType} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Group Request" id="group-request" />
                <Label htmlFor="group-request" className="font-normal">
                  Group Request
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Individual Request" id="individual-request" />
                <Label htmlFor="individual-request" className="font-normal">
                  Individual Request
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Without Request" id="without-request" />
                <Label htmlFor="without-request" className="font-normal">
                  Without Request
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
