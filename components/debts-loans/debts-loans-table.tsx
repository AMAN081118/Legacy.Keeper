"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DetailsDebtLoanModal } from "./details-debt-loan-modal"
import { EditDebtLoanModal } from "./edit-debt-loan-modal"
import { DeleteDebtLoanModal } from "./delete-debt-loan-modal"
import { DebtsLoansFilter } from "./debts-loans-filter"
import type { DebtLoan } from "@/lib/supabase/database.types"

interface DebtsLoansTableProps {
  data: DebtLoan[]
  type: "given" | "received"
}

export function DebtsLoansTable({ data, type }: DebtsLoansTableProps) {
  const [filteredData, setFilteredData] = useState<DebtLoan[]>(data)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDebtLoan, setSelectedDebtLoan] = useState<DebtLoan | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleFilter = useCallback((filtered: DebtLoan[]) => {
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (debtLoan: DebtLoan) => {
    setSelectedDebtLoan(debtLoan)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (debtLoan: DebtLoan) => {
    setSelectedDebtLoan(debtLoan)
    setIsEditModalOpen(true)
  }

  const handleDelete = (debtLoan: DebtLoan) => {
    setSelectedDebtLoan(debtLoan)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <DebtsLoansFilter originalData={data} onFilter={handleFilter} />

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Person</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Start Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Payment Mode</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{item.person}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </td>
                    <td className="px-4 py-3 text-sm">{format(new Date(item.start_date), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant="outline"
                        className={`${
                          item.status === "Active"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : item.status === "Completed"
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-red-500 bg-red-50 text-red-700"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.payment_mode || "N/A"}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {selectedDebtLoan && (
        <>
          <DetailsDebtLoanModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            debtLoan={selectedDebtLoan}
          />
          <EditDebtLoanModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            debtLoan={selectedDebtLoan}
          />
          <DeleteDebtLoanModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            debtLoan={selectedDebtLoan}
          />
        </>
      )}
    </div>
  )
}
