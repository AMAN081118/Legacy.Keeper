"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, X, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RequestFilter } from "./request-filter"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from "@/utils/csv-export"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { format, isAfter, isBefore, parseISO } from "date-fns"
import type { FilterOptions } from "@/types/request"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { RequestDetailModal } from "./request-detail-modal"
import { RejectReasonModal } from "./reject-reason-modal"
import { ApprovalNotesModal } from "./approval-notes-modal"
import { ConfirmationModal } from "@/components/requests/confirmation-modal"
import { DeleteConfirmationModal } from "@/components/requests/delete-confirmation-modal"
import { EditRequestModal } from "./edit-request-modal"

interface RequestReceivedTableProps {
  requests: any[]
  refreshRequests: () => void
}

export function RequestReceivedTable({ requests, refreshRequests }: RequestReceivedTableProps) {
  const [requestsData, setRequestsData] = useState<any[]>(requests)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState("5")
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationType, setConfirmationType] = useState<"approved" | "rejected">("approved")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Update requests data when props change
  useEffect(() => {
    setRequestsData(requests)
  }, [requests])

  // Apply filters to the data
  const applyFilters = (data: any[]) => {
    return data.filter((request) => {
      // Filter by status
      if (filters.status !== "all" && request.status !== filters.status) {
        return false
      }

      // Filter by date range
      if (filters.dateRange?.from || filters.dateRange?.to) {
        const requestDate = parseISO(request.created_at)

        if (filters.dateRange.from && isBefore(requestDate, filters.dateRange.from)) {
          return false
        }

        if (filters.dateRange.to && isAfter(requestDate, filters.dateRange.to)) {
          return false
        }
      }

      return true
    })
  }

  // Update active filters display
  useEffect(() => {
    const newActiveFilters: string[] = []

    if (filters.status !== "all") {
      newActiveFilters.push(`Status: ${filters.status}`)
    }

    if (filters.dateRange?.from) {
      newActiveFilters.push(`From: ${format(filters.dateRange.from, "dd/MM/yyyy")}`)
    }

    if (filters.dateRange?.to) {
      newActiveFilters.push(`To: ${format(filters.dateRange.to, "dd/MM/yyyy")}`)
    }

    setActiveFilters(newActiveFilters)
  }, [filters])

  // Filter requests based on search query and filters
  const filteredRequests = applyFilters(
    requestsData.filter(
      (request) =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.sender?.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    // Sort by most recent (created_at or date)
    .sort((a, b) => {
      const aDate = new Date(a.created_at || a.date || 0).getTime();
      const bDate = new Date(b.created_at || b.date || 0).getTime();
      return bDate - aDate;
    })
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / Number.parseInt(itemsPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(itemsPerPage)
  const endIndex = startIndex + Number.parseInt(itemsPerPage)
  const currentRequests = filteredRequests.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery, itemsPerPage])

  // Handle checkbox selection
  const handleSelectAll = () => {
    if (selectedRequests.length === currentRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(currentRequests.map((request) => request.id))
    }
  }

  const handleSelectRequest = (id: string) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter((requestId) => requestId !== id))
    } else {
      setSelectedRequests([...selectedRequests, id])
    }
  }

  // Handle request detail view
  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  // Handle request actions
  const handleReject = () => {
    setShowRejectModal(true)
  }

  const handleApprove = () => {
    setShowApproveModal(true)
  }

  const handleConfirmReject = async () => {
    if (selectedRequest) {
      setLoading(true)
      try {
        const res = await fetch("/api/requests/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_id: selectedRequest.id, status: "rejected" }),
        })
        if (!res.ok) throw new Error("Failed to update status")
        refreshRequests()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An error occurred while rejecting the request.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    setShowRejectModal(false)
    setConfirmationType("rejected")
    setShowConfirmationModal(true)
  }

  const handleConfirmApprove = async () => {
    if (selectedRequest) {
      setLoading(true)
      try {
        const res = await fetch("/api/requests/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_id: selectedRequest.id, status: "approved" }),
        })
        if (!res.ok) throw new Error("Failed to update status")
        refreshRequests()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An error occurred while approving the request.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    setShowApproveModal(false)
    setConfirmationType("approved")
    setShowConfirmationModal(true)
  }

  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false)
    setShowDetailModal(false)
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  // Handle download
  const handleDownload = () => {
    // Export all filtered data, not just the current page
    exportToCSV(filteredRequests, "requests_received.csv")
  }

  // Clear a specific filter
  const clearFilter = (filterType: string) => {
    if (filterType.startsWith("Status:")) {
      setFilters({ ...filters, status: "all" })
    } else if (filterType.startsWith("From:")) {
      setFilters({
        ...filters,
        dateRange: {
          from: undefined,
          to: filters.dateRange?.to
        },
      })
    } else if (filterType.startsWith("To:")) {
      setFilters({
        ...filters,
        dateRange: {
          from: filters.dateRange?.from,
          to: undefined
        },
      })
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      status: "all",
      dateRange: {
        from: undefined,
        to: undefined
      }
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
                <RequestFilter filters={filters} onFilterChange={handleFilterChange} onClose={() => {}} />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="h-9" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
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
                <th className="px-4 py-3">
                  <Checkbox
                    checked={selectedRequests.length === currentRequests.length && currentRequests.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3">Request Title</th>
                <th className="px-4 py-3">Email Id</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.length > 0 ? (
                currentRequests.map((request) => (
                  <tr key={request.id} className="border-b text-sm hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={() => handleSelectRequest(request.id)}
                        aria-label={`Select request ${request.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">{request.title}</td>
                    <td className="px-4 py-3">{request.sender?.email || request.email}</td>
                    <td className="px-4 py-3">₹{Number(request.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">{request.comment || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Search className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length}{" "}
              entries
            </p>
            <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
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

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={{
            ...selectedRequest,
            userName: selectedRequest.sender?.name || "User",
            email: selectedRequest.sender?.email || selectedRequest.email,
            date: format(parseISO(selectedRequest.created_at), "dd-MM-yyyy"),
            transactionType: selectedRequest.transaction_type || "Investment",
            details: selectedRequest.details || "No details provided",
            attachment: selectedRequest.attachment_url || "/placeholder.svg",
          }}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onReject={handleReject}
          onApprove={handleApprove}
        />
      )}

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
      />

      {/* Approval Notes Modal */}
      <ApprovalNotesModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleConfirmApprove}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal isOpen={showConfirmationModal} type={confirmationType} onClose={handleCloseConfirmation} />
    </>
  )
}
