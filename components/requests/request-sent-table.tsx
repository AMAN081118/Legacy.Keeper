"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RequestFilter } from "./request-filter"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from "@/utils/csv-export"
import { Pagination } from "@/components/ui/pagination"
import { RequestDetailModal } from "./request-detail-modal"
import type { RequestData, FilterOptions } from "@/types/request"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditRequestModal } from "./edit-request-modal"
import { toast } from "@/components/ui/use-toast"

interface RequestSentTableProps {
  requests: any[]
  refreshRequests: () => void
}

export function RequestSentTable({ requests, refreshRequests }: RequestSentTableProps) {
  const [requestsData, setRequestsData] = useState<any[]>(requests)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState("5")
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({ status: "all" })
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRequest, setEditRequest] = useState<RequestData | null>(null)

  useEffect(() => {
    setRequestsData(requests)
  }, [requests])

  // Filtering logic
  const applyFilters = (data: any[]) => {
    return data.filter((request) => {
      if (filters.status !== "all" && request.status !== filters.status) return false
      // Add date range filter if needed
      return true
    })
  }

  useEffect(() => {
    const newActiveFilters: string[] = []
    if (filters.status !== "all") newActiveFilters.push(`Status: ${filters.status}`)
    setActiveFilters(newActiveFilters)
  }, [filters])

  // Filter and search
  const filteredRequests = applyFilters(
    requestsData
      .filter(
        (request) =>
          request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.recipient?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aDate = new Date(a.created_at || a.date || 0).getTime();
        const bDate = new Date(b.created_at || b.date || 0).getTime();
        return bDate - aDate;
      })
  )

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / Number.parseInt(itemsPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(itemsPerPage)
  const endIndex = startIndex + Number.parseInt(itemsPerPage)
  const currentRequests = filteredRequests.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, searchQuery, itemsPerPage])

  // Modal handlers
  const handleViewRequest = (request: any) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  // Download CSV
  const handleDownload = () => {
    exportToCSV(filteredRequests, "requests_sent.csv")
  }

  // Handler for new request
  const handleNewRequest = () => {
    setEditRequest({
      id: '',
      title: '',
      email: '',
      amount: '',
      comment: '',
      status: 'pending',
      date: '',
      userName: '',
      transactionType: '',
      details: '',
      attachment: '',
    })
    setShowEditModal(true)
  }

  // Handler for editing existing request (pencil icon)
  const handleEditRequest = (request: any) => {
    setEditRequest(request)
    setShowEditModal(true)
  }

  // Handler for saving new request
  const handleSaveRequest = async (newRequest: RequestData) => {
    try {
      let res;
      if (newRequest.id) {
        // Update existing request
        res = await fetch("/api/requests/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRequest),
        });
      } else {
        // Create new request
        res = await fetch("/api/requests/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newRequest.title,
            amount: newRequest.amount,
            comment: newRequest.comment,
            transaction_type: newRequest.transactionType,
            details: newRequest.details,
            attachment: newRequest.attachment,
            recipient_email: newRequest.email,
          }),
        });
      }
      if (res.ok) {
        refreshRequests();
        toast({
          title: newRequest.id ? "Request updated" : "Request created",
          description: newRequest.id
            ? "Your request has been successfully updated."
            : "Your request has been successfully created.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to save request",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save request",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 pb-0">
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <RequestFilter filters={filters} onFilterChange={setFilters} />
            </PopoverContent>
          </Popover>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, idx) => (
                <Badge key={idx} variant="secondary">{filter}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
          <Button className="bg-blue-900 text-white" onClick={handleNewRequest}>+ New Request</Button>
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Request Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email Id</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No requests found.</td>
              </tr>
            ) : (
              currentRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{request.title}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{request.recipient?.email || request.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{request.amount}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{request.comment}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditRequest(request)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-2">
          <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">05</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-500">Items per page</span>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      {selectedRequest && (
        <RequestDetailModal
          request={{
            ...selectedRequest,
            userName: selectedRequest.recipient?.name || selectedRequest.userName || "",
            email: selectedRequest.recipient?.email || selectedRequest.email || "",
            transactionType: selectedRequest.transaction_type || selectedRequest.transactionType || "",
            details: selectedRequest.details || "",
            comment: selectedRequest.comment || "",
            attachment: selectedRequest.attachment_url || selectedRequest.attachment || "",
          }}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          mode="sent"
        />
      )}
      {showEditModal && editRequest && (
        <EditRequestModal
          request={editRequest}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveRequest}
          mode={editRequest.id ? 'edit' : 'add'}
        />
      )}
    </div>
  )
}
