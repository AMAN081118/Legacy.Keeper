"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteDepositInvestment } from "@/app/actions/deposits-investments"
import { useToast } from "@/components/ui/use-toast"
import type { DepositInvestment } from "@/lib/supabase/database.types"

interface DeleteDepositInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
  depositInvestment: DepositInvestment
}

export function DeleteDepositInvestmentModal({
  isOpen,
  onClose,
  onSuccess,
  depositInvestment,
}: DeleteDepositInvestmentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteDepositInvestment(depositInvestment.id)

      if (result.success) {
        toast({
          title: "Success",
          description: "Deposit/Investment deleted successfully",
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete deposit/investment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting deposit/investment:", error)
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
          <DialogTitle>Delete Investment or Deposit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this investment or deposit? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{depositInvestment.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span>₹{depositInvestment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{depositInvestment.investment_type}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
