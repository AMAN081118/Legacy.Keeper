"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, X, Pencil, Trash2, Plus, FileText, MoreHorizontal, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from "@/utils/csv-export"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { format, isAfter, isBefore, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionFilter } from "./transaction-filter"
import { AddTransactionModal } from "./add-transaction-modal"
import { EditTransactionModal } from "./edit-transaction-modal"
import { DeleteTransactionModal } from "./delete-transaction-modal"
import { TransactionDetailsModal } from "./transaction-details-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/ui/pagination"
import type { Tables } from "@/lib/supabase/database.types"

interface Transaction {
  id: string
  name: string
  user_id: string
  amount: number
  transaction_type: "Paid" | "Received"
  payment_mode: string | null
  date: string
  description: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
}

interface TransactionFilters {
  paymentMode: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface TransactionsTableProps {
  transactions: Transaction[]
  currentRole: string
}

export function TransactionsTable({ transactions: initialTransactions, currentRole }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<TransactionFilters>({
    paymentMode: "all",
    dateRange: {
      from: undefined,
      to: undefined
    }
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "all", name: "All" },
    { id: "cash", name: "Cash" },
    { id: "online", name: "Online" },
    { id: "card", name: "Cards" },
    { id: "app", name: "Payment Apps" },
    { id: "asset", name: "Asset Based" },
    { id: "other", name: "Others" },
  ])
  const [activePaymentMethod, setActivePaymentMethod] = useState("all")

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = transactions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  // Apply filters to the data
  const applyFilters = (data: Transaction[]) => {
    return data.filter((transaction) => {
      // Filter by payment mode
      if (activePaymentMethod !== "all") {
        const paymentModeMap: Record<string, string[]> = {
          cash: ["Cash"],
          online: ["Online Transfer", "Net Banking", "UPI"],
          card: ["Credit Card", "Debit Card"],
          app: ["Phone Pay", "Google Pay", "PayPal"],
          asset: ["Stock", "Crypto", "Gold"],
          other: ["Check", "Wire Transfer", "Other"],
        }

        if (
          activePaymentMethod !== "all" &&
          transaction.payment_mode &&
          !paymentModeMap[activePaymentMethod]?.includes(transaction.payment_mode)
        ) {
          return false
        }
      }

      // Filter by date range
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const transactionDate = parseISO(transaction.date)

        if (filters.dateRange.from && isBefore(transactionDate, filters.dateRange.from)) {
          return false
        }

        if (filters.dateRange.to && isAfter(transactionDate, filters.dateRange.to)) {
          return false
        }
      }

      return true
    })
  }

  // Update active filters display
  useEffect(() => {
    const newActiveFilters: string[] = []

    if (activePaymentMethod !== "all") {
      const methodName = paymentMethods.find((method) => method.id === activePaymentMethod)?.name
      newActiveFilters.push(`Payment Method: ${methodName}`)
    }

    if (filters.dateRange?.from) {
      newActiveFilters.push(`From: ${format(filters.dateRange.from, "dd/MM/yyyy")}`)
    }

    if (filters.dateRange?.to) {
      newActiveFilters.push(`To: ${format(filters.dateRange.to, "dd/MM/yyyy")}`)
    }

    setActiveFilters(newActiveFilters)
  }, [filters, activePaymentMethod, paymentMethods])

  // Filter transactions based on search query and filters
  const filteredTransactions = applyFilters(
    transactions.filter(
      (transaction) =>
        transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.payment_mode && transaction.payment_mode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase())),
    ),
  )

  // Handle transaction actions
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsModalOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedTransaction) {
      setLoading(true)
      try {
        const supabase = createClient()

        // Delete the transaction from the database
        const { error } = await supabase.from("transactions").delete().eq("id", selectedTransaction.id)

        if (error) throw error

        // Update the local state
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== selectedTransaction.id))

        toast({
          title: "Transaction deleted",
          description: "The transaction has been successfully deleted.",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An error occurred while deleting the transaction.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setIsDeleteModalOpen(false)
        setSelectedTransaction(null)
      }
    }
  }

  const handleAddTransaction = () => {
    setIsAddModalOpen(true)
  }

  const handleSaveTransaction = async (newTransaction: Partial<Transaction>) => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      // Add the transaction to the database
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          name: newTransaction.name || "",
          amount: newTransaction.amount || 0,
          transaction_type: newTransaction.transaction_type || "Paid",
          payment_mode: newTransaction.payment_mode || "Cash",
          date: newTransaction.date || new Date().toISOString(),
          description: newTransaction.description || null,
          attachment_url: newTransaction.attachment_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      // Update the local state
      if (data && data.length > 0) {
        setTransactions((prev) => [...prev, data[0]])
      }

      toast({
        title: "Transaction added",
        description: "The transaction has been successfully added.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the transaction.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsEditModalOpen(false)
    }
  }

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Update the transaction in the database
      const { error } = await supabase
        .from("transactions")
        .update({
          name: updatedTransaction.name,
          amount: updatedTransaction.amount,
          transaction_type: updatedTransaction.transaction_type,
          payment_mode: updatedTransaction.payment_mode,
          date: updatedTransaction.date,
          description: updatedTransaction.description,
          attachment_url: updatedTransaction.attachment_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedTransaction.id)

      if (error) throw error

      // Update the local state
      setTransactions((prev) =>
        prev.map((transaction) => (transaction.id === updatedTransaction.id ? updatedTransaction : transaction)),
      )

      toast({
        title: "Transaction updated",
        description: "The transaction has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the transaction.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsEditModalOpen(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
  }

  // Handle download
  const handleDownload = () => {
    // Export all filtered data, not just the current page
    exportToCSV(filteredTransactions, "transactions.csv")
  }

  // Clear a specific filter
  const clearFilter = (filterType: string) => {
    if (filterType.startsWith("Payment Method:")) {
      setActivePaymentMethod("all")
    } else if (filterType.startsWith("From:")) {
      setFilters({
        ...filters,
        dateRange: {
          from: undefined,
          to: filters.dateRange?.to ?? undefined,
        },
      })
    } else if (filterType.startsWith("To:")) {
      setFilters({
        ...filters,
        dateRange: {
          from: filters.dateRange?.from ?? undefined,
          to: undefined,
        },
      })
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActivePaymentMethod("all")
    setFilters({
      paymentMode: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search"
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <TransactionFilter filters={filters} onFilterChange={handleFilterChange} onClose={() => {}} />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="h-9" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button size="sm" className="h-9" onClick={handleAddTransaction}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Transaction
            </Button>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex flex-wrap gap-2 px-4">
          {paymentMethods.map((method) => (
            <Button
              key={method.id}
              variant={activePaymentMethod === method.id ? "default" : "outline"}
              size="sm"
              className={`h-9 ${activePaymentMethod === method.id ? "bg-primary text-white" : ""}`}
              onClick={() => setActivePaymentMethod(method.id)}
            >
              {method.name}
            </Button>
          ))}
        </div>

        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(filter)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {filter} filter</span>
                </Button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium text-gray-500">
                <th className="px-4 py-3">Transaction Name</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Transaction Type</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b text-sm hover:bg-gray-50">
                    <td className="px-4 py-3">{transaction.name}</td>
                    <td className="px-4 py-3">₹{Number(transaction.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.transaction_type === "Paid"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{transaction.payment_mode || "N/A"}</td>
                    <td className="px-4 py-3">{format(parseISO(transaction.date), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                        {currentRole !== "nominee" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteTransaction(transaction)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} entries
            </p>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNumber = i + 1
              return (
                <Button
                  key={i}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            {totalPages > 5 && <span>...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateTransaction}
        />
      )}

      {/* Delete Transaction Modal */}
      <DeleteTransactionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </>
  )
}
