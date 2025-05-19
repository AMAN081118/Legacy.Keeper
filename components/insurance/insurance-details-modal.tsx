"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"
import type { Insurance } from "@/lib/supabase/database.types"
import { formatCurrency } from "@/lib/utils"

export function InsuranceDetailsModal({
  insurance,
  children,
}: {
  insurance: Insurance
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Insurance Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Insurance Name</h3>
                <p className="mt-1">{insurance.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Insurance Type</h3>
                <p className="mt-1">{insurance.insurance_type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1">{new Date(insurance.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="mt-1">{formatCurrency(insurance.amount)}</p>
              </div>
            </div>

            {insurance.coverage_period && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Coverage Period</h3>
                <p className="mt-1">{insurance.coverage_period}</p>
              </div>
            )}

            {insurance.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 whitespace-pre-wrap">{insurance.description}</p>
              </div>
            )}

            {insurance.attachment_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Attachment</h3>
                <div className="mt-1">
                  <a
                    href={insurance.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    View Document
                    <ExternalLinkIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
