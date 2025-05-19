"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addFamilyMember } from "@/app/actions/family-vaults"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await addFamilyMember(formData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Family member added successfully",
        })
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add family member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding family member:", error)
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Add New Member
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>Add a new family member to your vault</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberName">Member Name</Label>
              <Input id="memberName" name="memberName" placeholder="Enter member name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input id="contactNumber" name="contactNumber" placeholder="Enter contact number" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
