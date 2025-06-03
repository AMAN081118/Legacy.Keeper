"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw, Download } from "lucide-react"
import { useState } from "react"
import { AddDepositInvestmentModal } from "./add-deposit-investment-modal"
import { useRole } from "@/components/dashboard/role-context"
import type { DepositInvestment } from "@/lib/supabase/database.types"

interface DepositsInvestmentsHeaderProps {
  totalAmount: number
  count: number
  onRefresh: () => Promise<void>
  depositsInvestments: DepositInvestment[]
}

export function DepositsInvestmentsHeader({ totalAmount, count, onRefresh, depositsInvestments }: DepositsInvestmentsHeaderProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { currentRole } = useRole()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Date", "Investment Name", "Investment Description", "Investment Type", "Amount"]
    const csvContent = [
      headers.join(","),
      ...depositsInvestments.map(item => [
        new Date(item.date).toLocaleDateString("en-IN"),
        `"${item.name.replace(/"/g, '""')}"`,
        `"${(item.description || "").replace(/"/g, '""')}"`,
        item.investment_type,
        item.amount
      ].join(","))
    ].join("\n")

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `deposits-investments-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deposits and Investments</h1>
          <p className="text-muted-foreground">View Deposits and Investments here!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          {currentRole?.name !== "nominee" && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add new Investment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-center">
          <div className="mr-4 bg-teal-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-600"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Amount Invested</p>
            <h2 className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</h2>
            <div className="mt-1">
              <a href="#" className="text-sm text-blue-600 hover:underline flex items-center">
                View Details
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
                  className="ml-1"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-center">
          <div className="mr-4 bg-green-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z" />
              <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z" />
              <line x1="12" y1="22" x2="12" y2="13" />
              <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Number of Investments</p>
            <h2 className="text-3xl font-bold">{count.toString().padStart(2, "0")}</h2>
            <div className="mt-1">
              <a href="#" className="text-sm text-blue-600 hover:underline flex items-center">
                View Details
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
                  className="ml-1"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <AddDepositInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  )
}
