"use client"

import { getInsuranceList } from "@/app/actions/insurance"
import { Pagination } from "@/components/ui/pagination"
import { InsuranceFilter } from "./insurance-filter"
import { formatCurrency } from "@/lib/utils"
import { DeleteInsuranceModal } from "./delete-insurance-modal"
import { EditInsuranceModal } from "./edit-insurance-modal"
import { InsuranceDetailsModal } from "./insurance-details-modal"
import { DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/utils/csv-export"
import { useEffect, useState } from "react"

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
  const pageSize = 5
  const [insurances, setInsurances] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getInsuranceList(currentPage, pageSize, insuranceType, searchQuery, userId).then(({ data, count }) => {
      setInsurances(data)
      setCount(count)
      setLoading(false)
    })
  }, [currentPage, insuranceType, searchQuery, userId])

  const totalPages = Math.ceil(count / pageSize)

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
                        <span className="cursor-pointer hover:text-blue-600">
                          {insurance.description || "For any emergency situation"}
                        </span>
                      </InsuranceDetailsModal>
                    </td>
                    <td className="px-4 py-3 text-sm">{insurance.insurance_type}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(insurance.amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <InsuranceDetailsModal insurance={insurance}>
                          <Button variant="outline" size="sm">View</Button>
                        </InsuranceDetailsModal>
                        <DeleteInsuranceModal id={insurance.id} />
                        <EditInsuranceModal id={insurance.id} />
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

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          baseUrl={`/dashboard/insurance?type=${insuranceType}${searchQuery ? `&search=${searchQuery}` : ""}&page=`}
        />
      )}
    </div>
  )
}
