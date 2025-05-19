"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteTrustee } from "@/app/actions/trustees"
import { useToast } from "@/components/ui/use-toast"

interface DeleteTrusteeModalProps {
  isOpen: boolean
  onClose: () => void
  trusteeId: string
  trusteeName: string
  onDeleteTrustee: (id: string) => void
}

export function DeleteTrusteeModal({
  isOpen,
  onClose,
  trusteeId,
  trusteeName,
  onDeleteTrustee,
}: DeleteTrusteeModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteTrustee(trusteeId)

      if (result.error) {
        throw new Error(result.error)
      }

      onDeleteTrustee(trusteeId)
      onClose()
    } catch (error) {
      console.error("Error deleting trustee:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete trustee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Trustee</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {trusteeName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
