"use client"

import { getInsuranceList } from "@/app/actions/insurance"
import { Pagination } from "@/components/ui/pagination"
import { InsuranceFilter } from "./insurance-filter"
import { formatCurrency } from "@/lib/utils"
import { DeleteInsuranceModal } from "./delete-insurance-modal"
import { EditInsuranceModal } from "./edit-insurance-modal"
import { InsuranceDetailsModal } from "./insurance-details-modal"
import { DownloadIcon, FileText, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/utils/csv-export"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InsuranceTable({
  currentPage = 1,
  insuranceType = "All",
  searchQuery = "",
  userId,
}: {
  currentPage?: number
  insuranceType?: string
  searchQuery?: string
  userId?: string
}) {
  const [itemsPerPage, setItemsPerPage] = useState("5")
  const [insurances, setInsurances] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getInsuranceList(currentPage, Number(itemsPerPage), insuranceType, searchQuery, userId).then(({ data, count }) => {
      setInsurances(data)
      setCount(count)
      setLoading(false)
    })
  }, [currentPage, itemsPerPage, insuranceType, searchQuery, userId])

  const totalPages = Math.ceil(count / Number(itemsPerPage))
  const startIndex = (currentPage - 1) * Number(itemsPerPage)
  const endIndex = Math.min(startIndex + Number(itemsPerPage), count)

  const handleExportCSV = async () => {
    const { data } = await getInsuranceList(1, 1000, insuranceType, searchQuery, userId)
    const csvData = data.map((item: any) => ({
      Date: new Date(item.date).toLocaleDateString(),
      Name: item.name,
      Type: item.insurance_type,
      Amount: formatCurrency(item.amount),
      Description: item.description || "",
    }))
    exportToCSV(csvData, "insurance_data")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <InsuranceFilter />
        <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
          <DownloadIcon className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Insurance Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Insurance Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : insurances.length > 0 ? (
                insurances.map((insurance) => (
                  <tr key={insurance.id} className="border-b">
                    <td className="px-4 py-3 text-sm">{new Date(insurance.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <InsuranceDetailsModal insurance={insurance}>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">{insurance.name}</h3>
                            <p className="text-sm text-muted-foreground">{insurance.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Type</p>
                              <p className="text-sm">{insurance.insurance_type}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Amount</p>
                              <p className="text-sm">₹{insurance.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </InsuranceDetailsModal>
                    </td>
                    <td className="px-4 py-3 text-sm">{insurance.insurance_type}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(insurance.amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <InsuranceDetailsModal insurance={insurance}>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold">{insurance.name}</h3>
                              <p className="text-sm text-muted-foreground">{insurance.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Type</p>
                                <p className="text-sm">{insurance.insurance_type}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Amount</p>
                                <p className="text-sm">₹{insurance.amount.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </InsuranceDetailsModal>
                        <EditInsuranceModal id={insurance.id} />
                        <DeleteInsuranceModal id={insurance.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No insurance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t px-4 py-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {endIndex} of {count} entries
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

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/insurance?type=${insuranceType}${searchQuery ? `&search=${searchQuery}` : ""}&page=${Math.max(currentPage - 1, 1)}`}
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
                onClick={() => window.location.href = `/dashboard/insurance?type=${insuranceType}${searchQuery ? `&search=${searchQuery}` : ""}&page=${pageNumber}`}
              >
                {pageNumber}
              </Button>
            )
          })}
          {totalPages > 5 && <span>...</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/insurance?type=${insuranceType}${searchQuery ? `&search=${searchQuery}` : ""}&page=${Math.min(currentPage + 1, totalPages)}`}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
