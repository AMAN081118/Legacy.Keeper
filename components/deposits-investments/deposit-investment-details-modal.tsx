"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DepositInvestment } from "@/lib/supabase/database.types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Investment or Deposit Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{depositInvestment.name}</h3>
              <p className="text-muted-foreground">{depositInvestment.investment_type}</p>
            </div>
            <Badge className={getStatusColor(depositInvestment.status)}>{depositInvestment.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">₹{depositInvestment.amount.toLocaleString()}</p>
            </div>
            {depositInvestment.expected_returns && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expected Returns</p>
                <p className="text-lg font-semibold">₹{depositInvestment.expected_returns.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Investment Date</p>
              <p>{formatDate(depositInvestment.date)}</p>
            </div>
            {depositInvestment.maturity_date && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Maturity Date</p>
                <p>{formatDate(depositInvestment.maturity_date)}</p>
              </div>
            )}
          </div>

          {depositInvestment.interest_rate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
              <p>{depositInvestment.interest_rate}%</p>
            </div>
          )}

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
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Attachment</p>
              <a
                href={depositInvestment.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                View Attachment
              </a>
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
