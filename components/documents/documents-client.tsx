"use client"

import { useState } from "react"
import { DocumentsHeader } from "./documents-header"
import { DocumentsTable } from "./documents-table"
import { AddDocumentModal } from "./add-document-modal"
import { EditDocumentModal } from "./edit-document-modal"
import { DeleteDocumentModal } from "./delete-document-modal"
import { ViewDocumentModal } from "./view-document-modal"
import type { Document } from "@/lib/supabase/database.types"
import { useToast } from "@/components/ui/use-toast"

interface DocumentsClientProps {
  initialDocuments: Document[]
  userId: string
}

export function DocumentsClient({ initialDocuments, userId }: DocumentsClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddDocument = (newDocument: Document) => {
    setDocuments([newDocument, ...documents])
    setIsAddModalOpen(false)
    toast({
      title: "Document added",
      description: "Your document has been added successfully.",
    })
  }

  const handleUpdateDocument = (updatedDocument: Document) => {
    setDocuments(documents.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc)))
    setIsEditModalOpen(false)
    setSelectedDocument(null)
    toast({
      title: "Document updated",
      description: "Your document has been updated successfully.",
    })
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
    setIsDeleteModalOpen(false)
    setSelectedDocument(null)
    toast({
      title: "Document deleted",
      description: "Your document has been deleted successfully.",
    })
  }

  const openEditModal = (document: Document) => {
    setSelectedDocument(document)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (document: Document) => {
    setSelectedDocument(document)
    setIsDeleteModalOpen(true)
  }

  const openViewModal = (document: Document) => {
    setSelectedDocument(document)
    setIsViewModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <DocumentsHeader
        onAddNew={() => setIsAddModalOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        documentsCount={documents.length}
      />

      <DocumentsTable
        documents={filteredDocuments}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onView={openViewModal}
      />

      {isAddModalOpen && (
        <AddDocumentModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDocument}
          userId={userId}
        />
      )}

      {isEditModalOpen && selectedDocument && (
        <EditDocumentModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDocument(null)
          }}
          onUpdate={handleUpdateDocument}
          document={selectedDocument}
        />
      )}

      {isDeleteModalOpen && selectedDocument && (
        <DeleteDocumentModal
          open={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedDocument(null)
          }}
          onDelete={() => handleDeleteDocument(selectedDocument.id)}
          documentTitle={selectedDocument.title}
        />
      )}

      {isViewModalOpen && selectedDocument && (
        <ViewDocumentModal
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedDocument(null)
          }}
          document={selectedDocument}
        />
      )}
    </div>
  )
}
