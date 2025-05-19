"use client"

import type React from "react"

import { useState } from "react"
import type { DepositInvestment } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import { AddDepositInvestmentModal } from "./add-deposit-investment-modal"
import { EditDepositInvestmentModal } from "./edit-deposit-investment-modal"
import { DeleteDepositInvestmentModal } from "./delete-deposit-investment-modal"
import { DepositInvestmentDetailsModal } from "./deposit-investment-details-modal"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

interface DepositsInvestmentsTableProps {
  depositsInvestments: DepositInvestment[]
  loading: boolean
  onRefresh: () => Promise<void>
}

export function DepositsInvestmentsTable({ depositsInvestments, loading, onRefresh }: DepositsInvestmentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedItem, setSelectedItem] = useState<DepositInvestment | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = depositsInvestments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(depositsInvestments.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getInvestmentTypeLabel = (type: string) => {
    switch (type) {
      case "Bank":
        return "FD"
      case "Gold":
      case "Silver":
        return type
      case "Shares":
      case "Bond":
        return type
      case "Property":
        return "Property"
      case "DigitalAsset":
        return "Digital Asset"
      case "Other":
        return "Other"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Investment Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Investment Description</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Investment Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
                <th className="h-12 px-4 text-center align-middle font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    No deposits or investments found
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">{formatDate(item.date)}</td>
                    <td className="p-4 align-middle font-medium">{item.name}</td>
                    <td className="p-4 align-middle">{item.description || "-"}</td>
                    <td className="p-4 align-middle">{getInvestmentTypeLabel(item.investment_type)}</td>
                    <td className="p-4 align-middle">₹{item.amount.toLocaleString()}</td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDetailsModalOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">{Math.min(indexOfLastItem, depositsInvestments.length)}</span> of{" "}
            <span className="font-medium">{depositsInvestments.length}</span> entries
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Items per page</p>
            <select
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>05</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => Math.abs(page - currentPage) < 2 || page === 1 || page === totalPages)
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            </PaginationItem>
            <PaginationItem>
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Modals */}
      <AddDepositInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onRefresh}
      />

      {selectedItem && (
        <>
          <EditDepositInvestmentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={onRefresh}
            depositInvestment={selectedItem}
          />

          <DeleteDepositInvestmentModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={onRefresh}
            depositInvestment={selectedItem}
          />

          <DepositInvestmentDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            depositInvestment={selectedItem}
          />
        </>
      )}
    </div>
  )
}
