"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/supabase/database.types"
import { FileText, Download } from "lucide-react"

interface ViewDocumentModalProps {
  open: boolean
  onClose: () => void
  document: Document
}

export function ViewDocumentModal({ open, onClose, document }: ViewDocumentModalProps) {
  const handleDownload = () => {
    if (document.attachment_url) {
      window.open(document.attachment_url, "_blank")
    }
  }

  const renderDocumentPreview = () => {
    if (!document.attachment_url) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-md">
          <FileText className="h-16 w-16 text-gray-400" />
          <p className="mt-4 text-gray-500">No attachment available</p>
        </div>
      )
    }

    const fileExtension = document.attachment_url.split(".").pop()?.toLowerCase()

    if (fileExtension === "pdf") {
      return <iframe src={document.attachment_url} className="w-full h-96 border rounded-md" title={document.title} />
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || "")) {
      return (
        <div className="flex justify-center">
          <img
            src={document.attachment_url || "/placeholder.svg"}
            alt={document.title}
            className="max-h-96 max-w-full object-contain rounded-md"
          />
        </div>
      )
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-md">
          <FileText className="h-16 w-16 text-gray-400" />
          <p className="mt-4 text-gray-500">Preview not available</p>
          <Button variant="outline" className="mt-4" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download File
          </Button>
        </div>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {document.description && (
            <div>
              <h3 className="text-sm font-medium">Description:</h3>
              <p className="text-sm text-gray-500 mt-1">{document.description}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium">Document Type:</h3>
            <p className="text-sm text-gray-500 mt-1">{document.document_type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Document Preview:</h3>
            <div className="mt-2">{renderDocumentPreview()}</div>
          </div>
        </div>
        <DialogFooter>
          {document.attachment_url && (
            <Button type="button" variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          )}
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
