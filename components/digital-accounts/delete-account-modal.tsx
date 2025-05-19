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
import { deleteDigitalAccount } from "@/app/actions/digital-accounts"
import { useToast } from "@/components/ui/use-toast"
import type { DigitalAccount } from "@/lib/supabase/database.types"
import { AlertTriangle } from "lucide-react"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  account: DigitalAccount
}

export function DeleteAccountModal({ isOpen, onClose, onSuccess, account }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteDigitalAccount(account.id)

      if (result.success) {
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete account",
          variant: "destructive",
        })
      }
    } catch (error) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-muted p-4">
            <p className="font-medium">{account.account_name}</p>
            {account.account_id_no && <p className="text-sm text-muted-foreground">ID/No: {account.account_id_no}</p>}
          </div>
        </div>

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
