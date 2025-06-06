"use client"

import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/supabase/database.types"
import { Eye, Pencil, Trash2, Download } from "lucide-react"
import { EmptyState } from "./empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { useState } from "react"

interface DocumentsTableProps {
  documents: Document[]
  onEdit: (document: Document) => void
  onDelete: (document: Document) => void
  onView: (document: Document) => void
}

export function DocumentsTable({ documents, onEdit, onDelete, onView }: DocumentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleDownloadCSV = () => {
    // Define CSV headers
    const headers = ["Title", "Description", "Document Type", "Created At", "Updated At"]
    
    // Convert documents to CSV rows
    const csvRows = documents.map(doc => [
      doc.title,
      doc.description || "",
      doc.document_type,
      new Date(doc.created_at).toLocaleString(),
      new Date(doc.updated_at).toLocaleString()
    ])
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `documents_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (documents.length === 0) {
    return <EmptyState />
  }

  // Calculate pagination
  const totalPages = Math.ceil(documents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocuments = documents.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="p-4 border-b flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Title</TableHead>
            <TableHead>Document Description</TableHead>
            <TableHead>Document Type</TableHead>
            <TableHead>Document Attachment</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDocuments.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="font-medium">{document.title}</TableCell>
              <TableCell>{document.description || "-"}</TableCell>
              <TableCell>{document.document_type}</TableCell>
              <TableCell>
                <Button variant="link" onClick={() => onView(document)}>
                  View
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onView(document)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(document)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(document)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="text-sm text-gray-500">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, documents.length)} of {documents.length} items
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
