"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Pencil, Trash2, Eye, Plus, FileImage, FileIcon as FilePdf, FileArchive } from "lucide-react"
import Link from "next/link"
import { AddDocumentModal } from "./add-document-modal"
import { EditDocumentModal } from "./edit-document-modal"
import { DeleteDocumentModal } from "./delete-document-modal"
import { EditMemberModal } from "./edit-member-modal"
import { DeleteMemberModal } from "./delete-member-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FamilyMember, FamilyDocument } from "@/lib/supabase/database.types"

interface FamilyMemberDetailClientProps {
  member: FamilyMember
  documents: FamilyDocument[]
}

export function FamilyMemberDetailClient({ member, documents: initialDocuments }: FamilyMemberDetailClientProps) {
  const [documents, setDocuments] = useState<FamilyDocument[]>(initialDocuments)
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false)
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false)
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<FamilyDocument | null>(null)
  const [isEditDocModalOpen, setIsEditDocModalOpen] = useState(false)
  const [isDeleteDocModalOpen, setIsDeleteDocModalOpen] = useState(false)
  const [isViewDocModalOpen, setIsViewDocModalOpen] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<FamilyDocument | null>(null)

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Get document icon based on category or file type
  const getDocumentIcon = (document: FamilyDocument) => {
    if (!document.attachment_url) return <FileText className="h-4 w-4" />

    const url = document.attachment_url.toLowerCase()
    if (url.endsWith(".pdf")) return <FilePdf className="h-4 w-4" />
    if (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif"))
      return <FileImage className="h-4 w-4" />
    if (url.endsWith(".zip") || url.endsWith(".rar")) return <FileArchive className="h-4 w-4" />

    return <FileText className="h-4 w-4" />
  }

  // Handle document view
  const handleViewDocument = (doc: FamilyDocument) => {
    if (doc.attachment_url) {
      setViewingDocument(doc)
      setIsViewDocModalOpen(true)
    }
  }

  // Determine if file is viewable in browser
  const isViewableInBrowser = (url: string) => {
    const lowerUrl = url.toLowerCase()
    return (
      lowerUrl.endsWith(".jpg") ||
      lowerUrl.endsWith(".jpeg") ||
      lowerUrl.endsWith(".png") ||
      lowerUrl.endsWith(".gif") ||
      lowerUrl.endsWith(".pdf")
    )
  }

  return (
    <>
      <div className="flex flex-col space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard/family-vaults" className="text-muted-foreground hover:text-foreground">
            Family Vault
          </Link>
          <span className="text-muted-foreground">&gt;</span>
          <span>{member.member_name}</span>
        </div>

        {/* Profile Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Profile Details</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setIsEditMemberModalOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
                onClick={() => setIsDeleteMemberModalOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{member.member_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium">{member.contact_number || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Documents ({documents.length})</h2>
            <Button className="flex items-center gap-1" onClick={() => setIsAddDocModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add New Document
            </Button>
          </div>

          {documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Document Title</th>
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-center py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-2 px-4">{formatDate(doc.document_date)}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(doc)}
                          {doc.document_title}
                        </div>
                      </td>
                      <td className="py-2 px-4">{doc.document_category || "Uncategorized"}</td>
                      <td className="py-2 px-4 max-w-xs truncate">{doc.description || "No description"}</td>
                      <td className="py-2 px-4">
                        <div className="flex justify-center space-x-2">
                          {doc.attachment_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleViewDocument(doc)}
                              title="View Document"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedDocument(doc)
                              setIsEditDocModalOpen(true)
                            }}
                            title="Edit Document"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedDocument(doc)
                              setIsDeleteDocModalOpen(true)
                            }}
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <h3 className="mt-2 text-lg font-medium">No Documents Found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding a new document.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <Dialog open={isViewDocModalOpen} onOpenChange={setIsViewDocModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.document_title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewingDocument?.attachment_url && (
              <div className="flex flex-col space-y-4">
                {isViewableInBrowser(viewingDocument.attachment_url) ? (
                  <div className="border rounded-md overflow-hidden" style={{ height: "70vh" }}>
                    {viewingDocument.attachment_url.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={`${viewingDocument.attachment_url}#toolbar=1&navpanes=1`}
                        className="w-full h-full"
                        title={viewingDocument.document_title}
                      />
                    ) : (
                      <img
                        src={viewingDocument.attachment_url || "/placeholder.svg"}
                        alt={viewingDocument.document_title}
                        className="max-w-full max-h-full object-contain mx-auto"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="mt-4">This file type cannot be previewed directly in the browser.</p>
                  </div>
                )}
                <div className="flex justify-center">
                  <Button
                    onClick={() => window.open(viewingDocument.attachment_url!, "_blank")}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Modals */}
      <AddDocumentModal
        isOpen={isAddDocModalOpen}
        onClose={() => setIsAddDocModalOpen(false)}
        familyMemberId={member.id}
      />

      <EditMemberModal isOpen={isEditMemberModalOpen} onClose={() => setIsEditMemberModalOpen(false)} member={member} />

      <DeleteMemberModal
        isOpen={isDeleteMemberModalOpen}
        onClose={() => setIsDeleteMemberModalOpen(false)}
        member={member}
      />

      {selectedDocument && (
        <>
          <EditDocumentModal
            isOpen={isEditDocModalOpen}
            onClose={() => {
              setIsEditDocModalOpen(false)
              setSelectedDocument(null)
            }}
            document={selectedDocument}
            familyMemberId={member.id}
          />

          <DeleteDocumentModal
            isOpen={isDeleteDocModalOpen}
            onClose={() => {
              setIsDeleteDocModalOpen(false)
              setSelectedDocument(null)
            }}
            document={selectedDocument}
            familyMemberId={member.id}
          />
        </>
      )}
    </>
  )
}
