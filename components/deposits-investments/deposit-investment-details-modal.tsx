"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DepositInvestment } from "@/lib/supabase/database.types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { FileUpload } from "@/components/ui/file-upload"

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

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(extension || '')) return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image'
    if (['doc', 'docx'].includes(extension || '')) return 'document'
    return 'other'
  }

  const renderFileViewer = () => {
    if (!depositInvestment.attachment_url) return null

    const fileType = getFileType(depositInvestment.attachment_url)

    switch (fileType) {
      case 'pdf':
        return (
          <iframe
            src={depositInvestment.attachment_url}
            className="w-full h-[500px] border rounded-lg"
            title="PDF Viewer"
          />
        )
      case 'image':
        return (
          <img
            src={depositInvestment.attachment_url}
            alt="Attachment"
            className="max-w-full h-auto rounded-lg"
          />
        )
      case 'document':
      case 'other':
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground mb-4">This file type cannot be previewed directly.</p>
            <Button
              variant="outline"
              onClick={() => window.open(depositInvestment.attachment_url, '_blank')}
            >
              Open File
            </Button>
          </div>
        )
      default:
        return null
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
            <Badge className={getStatusColor(depositInvestment.status)}>{depositInvestment.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">₹{(depositInvestment.amount * 1000).toLocaleString()}</p>
            </div>
            {depositInvestment.expected_returns && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expected Returns</p>
                <p className="text-lg font-semibold">₹{(depositInvestment.expected_returns * 1000).toLocaleString()}</p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Attachment</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(depositInvestment.attachment_url, '_blank')}
                >
                  View Attachment
                </Button>
              </div>
              {renderFileViewer()}
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
