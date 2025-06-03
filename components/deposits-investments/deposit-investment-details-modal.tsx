"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DepositInvestment } from "@/lib/supabase/database.types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface DepositInvestmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  depositInvestment: DepositInvestment
}

export function DepositInvestmentDetailsModal({
  isOpen,
  onClose,
  depositInvestment,
}: DepositInvestmentDetailsModalProps) {
  const [showFileViewer, setShowFileViewer] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return "Invalid date"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Matured":
        return "bg-blue-100 text-blue-800"
      case "Withdrawn":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Investment or Deposit Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{depositInvestment.name}</h3>
              <p className="text-muted-foreground">{depositInvestment.investment_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">₹{(depositInvestment.amount * 1000).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Investment Date</p>
              <p>{formatDate(depositInvestment.date)}</p>
            </div>
          </div>

          {depositInvestment.paid_to && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Paid To</p>
              <p>{depositInvestment.paid_to}</p>
            </div>
          )}

          {depositInvestment.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap">{depositInvestment.description}</p>
            </div>
          )}

          {depositInvestment.attachment_url && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Attachment</p>
                <a
                  href={depositInvestment.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  View Attachment
                </a>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
