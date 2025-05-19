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
import { deleteFamilyDocument } from "@/app/actions/family-vaults"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

interface DeleteDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
  familyMemberId: string
}

export function DeleteDocumentModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  familyMemberId,
}: DeleteDocumentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteFamilyDocument(documentId, familyMemberId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting document:", error)
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
            Delete Document
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{documentTitle}&quot;? This action cannot be undone.
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
