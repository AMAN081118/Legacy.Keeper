"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, FileText, Calendar, DollarSign, User, CreditCard, Shield, FileCheck } from "lucide-react"
import { format } from "date-fns"
import type { DebtLoan } from "@/lib/supabase/database.types"

interface DetailsDebtLoanModalProps {
  isOpen: boolean
  onClose: () => void
  debtLoan: DebtLoan
}

export function DetailsDebtLoanModal({ isOpen, onClose, debtLoan }: DetailsDebtLoanModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Debt/Loan Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <p className="font-medium">Money {debtLoan.transaction_type}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Person</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <p className="font-medium">{debtLoan.person}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Amount</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <p className="font-medium">
                  {debtLoan.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <p
                  className={`font-medium ${
                    debtLoan.status === "Active"
                      ? "text-green-600"
                      : debtLoan.status === "Completed"
                        ? "text-blue-600"
                        : "text-red-600"
                  }`}
                >
                  {debtLoan.status}
                </p>
              </div>
            </div>
          </div>

          {(debtLoan.interest || debtLoan.amount_due) && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {debtLoan.interest && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Interest</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">
                      {debtLoan.interest.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                  </div>
                </div>
              )}
              {debtLoan.amount_due && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">
                      {debtLoan.amount_due.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Start Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="font-medium">{format(new Date(debtLoan.start_date), "PPP")}</p>
              </div>
            </div>
            {debtLoan.due_date && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <p className="font-medium">{format(new Date(debtLoan.due_date), "PPP")}</p>
                </div>
              </div>
            )}
          </div>

          {(debtLoan.payment_mode || debtLoan.security) && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {debtLoan.payment_mode && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Mode</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">{debtLoan.payment_mode}</p>
                  </div>
                </div>
              )}
              {debtLoan.security && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Security</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">{debtLoan.security}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {debtLoan.purpose && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Purpose/Description</p>
              <div className="mt-1 rounded-md border p-3">
                <p>{debtLoan.purpose}</p>
              </div>
            </div>
          )}

          {debtLoan.attachment_url && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">Attachment</p>
              <div className="mt-1">
                <a
                  href={debtLoan.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View Attachment
                </a>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
