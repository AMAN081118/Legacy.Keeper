"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import type { BusinessPlan } from "@/lib/supabase/database.types"

interface ViewBusinessPlanModalProps {
  businessPlan: BusinessPlan
}

export function ViewBusinessPlanModal({ businessPlan }: ViewBusinessPlanModalProps) {
  const [open, setOpen] = useState(false)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-8 w-8">
        <Eye className="h-4 w-4" />
        <span className="sr-only">View</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Business Plan Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                <p className="mt-1">{businessPlan.business_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Business Type and Owner</h3>
                <p className="mt-1">{businessPlan.business_type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Investment Amount</h3>
                <p className="mt-1">{formatCurrency(businessPlan.investment_amount)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ownership Percentage</h3>
                <p className="mt-1">{businessPlan.ownership_percentage || "-"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Succession Plans and Notes</h3>
              <p className="mt-1 whitespace-pre-wrap">{businessPlan.succession_plans || "-"}</p>
            </div>

            {/* Attachment field: always show */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Attachment</h3>
              <div className="mt-2">
                {businessPlan.attachment_url ? (
                  <a
                    href={businessPlan.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    View Document
                  </a>
                ) : (
                  <span className="text-gray-400">No attachment</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="mt-1">
                  {new Date(businessPlan.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">
                  {new Date(businessPlan.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
