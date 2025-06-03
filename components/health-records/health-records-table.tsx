"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DownloadIcon, Eye, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { HealthRecord } from "@/lib/supabase/database.types"
import { ViewMemberModal } from "./view-member-modal"
import { EditMemberModal } from "./edit-member-modal"
import { DeleteMemberModal } from "./delete-member-modal"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { exportToCSV } from "@/utils/csv-export"

interface HealthRecordsTableProps {
  healthRecords: HealthRecord[]
}

export function HealthRecordsTable({ healthRecords }: HealthRecordsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [viewRecord, setViewRecord] = useState<HealthRecord | null>(null)
  const [editRecord, setEditRecord] = useState<HealthRecord | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<HealthRecord | null>(null)

  // Filter records based on search term
  const filteredRecords = healthRecords.filter((record) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      record.member_name.toLowerCase().includes(searchTermLower) ||
      (record.gender && record.gender.toLowerCase().includes(searchTermLower)) ||
      (record.contact_number && record.contact_number.includes(searchTerm))
    )
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd-MM-yyyy")
    } catch (error) {
      return "Invalid Date"
    }
  }

  const handleRowClick = (recordId: string) => {
    router.push(`/dashboard/health-records/${recordId}`)
  }

  const handleExportCSV = () => {
    const csvData = healthRecords.map((record) => ({
      Date: formatDate(record.created_at),
      "Member Name": record.member_name,
      Gender: record.gender || "N/A",
      "Date of Birth": formatDate(record.dob),
      "Contact Number": record.contact_number || "N/A",
      "Blood Group": record.blood_group || "N/A",
      "Emergency Contact": record.emergency_contact || "N/A",
      "Medical Conditions": record.medical_conditions || "N/A",
      Allergies: record.allergies || "N/A",
      Medications: record.medications || "N/A",
    }))
    exportToCSV(csvData, "health_records")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
          <DownloadIcon className="h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Member name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Gender
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  DOB
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Contact Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(record.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${record.member_name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRowClick(record.id)
                    }
                  }}
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(record.created_at)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {record.member_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{record.gender || "N/A"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {record.dob ? formatDate(record.dob) : "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {record.contact_number || "N/A"}
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4 text-sm font-medium"
                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on actions
                  >
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setViewRecord(record)
                        }}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label={`View ${record.member_name}`}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditRecord(record)
                        }}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label={`Edit ${record.member_name}`}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteRecord(record)
                        }}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label={`Delete ${record.member_name}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {itemsPerPage < 10 ? "0" : ""}
          {itemsPerPage} Items per page
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {viewRecord && <ViewMemberModal record={viewRecord} open={!!viewRecord} onClose={() => setViewRecord(null)} />}

      {editRecord && <EditMemberModal record={editRecord} open={!!editRecord} onClose={() => setEditRecord(null)} />}

      {deleteRecord && (
        <DeleteMemberModal record={deleteRecord} open={!!deleteRecord} onClose={() => setDeleteRecord(null)} />
      )}
    </div>
  )
}
