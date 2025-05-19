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
import { deleteFamilyMember } from "@/app/actions/family-vaults"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

interface DeleteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  memberId: string
  memberName: string
}

export function DeleteMemberModal({ isOpen, onClose, memberId, memberName }: DeleteMemberModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteFamilyMember(memberId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Family member deleted successfully",
        })
        router.push("/dashboard/family-vaults")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete family member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting family member:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Delete Member
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {memberName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
