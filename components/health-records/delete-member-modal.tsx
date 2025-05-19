"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteHealthRecord } from "@/app/actions/health-records"
import { useToast } from "@/components/ui/use-toast"
import type { HealthRecord } from "@/lib/supabase/database.types"

interface DeleteMemberModalProps {
  record: HealthRecord
  open: boolean
  onClose: () => void
}

export function DeleteMemberModal({ record, open, onClose }: DeleteMemberModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteHealthRecord(record.id)

      if (result.success) {
        toast({
          title: "Success",
          description: "Health record deleted successfully",
        })
        onClose()
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete health record",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting health record:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the health record for {record.member_name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
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
