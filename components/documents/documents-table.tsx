"use client"

import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/supabase/database.types"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { EmptyState } from "./empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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

  if (documents.length === 0) {
    return <EmptyState />
  }

  // Calculate pagination
  const totalPages = Math.ceil(documents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocuments = documents.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="rounded-lg border bg-white">
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
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
