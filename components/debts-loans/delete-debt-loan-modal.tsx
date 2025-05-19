"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { DebtLoan } from "@/lib/supabase/database.types"

interface DeleteDebtLoanModalProps {
  isOpen: boolean
  onClose: () => void
  debtLoan: DebtLoan
}

export function DeleteDebtLoanModal({ isOpen, onClose, debtLoan }: DeleteDebtLoanModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      // Delete the record
      const { error } = await supabase.from("debts_loans").delete().eq("id", debtLoan.id)

      if (error) throw new Error(`Error deleting debt/loan: ${error.message}`)

      // Delete the attachment if it exists
      if (debtLoan.attachment_url) {
        // Extract the file path from the URL
        const urlParts = debtLoan.attachment_url.split("/")
        const fileName = urlParts[urlParts.length - 1]

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const filePath = `${user.id}/${fileName}`

          // Delete the file
          const { error: deleteError } = await supabase.storage.from("debts_loans_documents").remove([filePath])

          if (deleteError) {
            console.error("Error deleting file:", deleteError)
            // Continue even if file deletion fails
          }
        }
      }

      toast({
        title: "Success",
        description: "Debt/loan entry deleted successfully.",
      })

      // Close the modal and refresh the page
      onClose()
      router.refresh()
    } catch (error: any) {
      console.error("Error deleting debt/loan:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the entry.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this entry?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the debt/loan entry for {debtLoan.person}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
