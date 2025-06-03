"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateFamilyDocument } from "@/app/actions/family-vaults"
import { useToast } from "@/components/ui/use-toast"
import { FileUp, Loader2, Eye } from "lucide-react"
import type { FamilyDocument } from "@/lib/supabase/database.types"

interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: FamilyDocument
  familyMemberId: string
}

export function EditDocumentModal({ isOpen, onClose, document, familyMemberId }: EditDocumentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  // Format date for input field
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      const result = await updateFamilyDocument(document.id, familyMemberId, formData)

      if (result.success) {
        toast({
          title: "Document updated",
          description: "The document has been updated successfully.",
        })
        onClose()
        // Refresh the page to show the updated document
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update document. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating document:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentTitle">Document Title</Label>
            <Input id="documentTitle" name="documentTitle" defaultValue={document.document_title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentCategory">Document Category</Label>
            <Input
              id="documentCategory"
              name="documentCategory"
              defaultValue={document.document_category || ""}
              placeholder="e.g., Government ID, Certificate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentDate">Document Date</Label>
            <Input
              id="documentDate"
              name="documentDate"
              type="date"
              defaultValue={formatDateForInput(document.document_date)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={document.description || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachment">Attach Document</Label>
            {document.attachment_url && (
              <div className="flex items-center mb-2 p-2 bg-gray-50 rounded">
                <span className="text-sm truncate flex-1">{document.attachment_url.split("/").pop()}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-blue-600"
                  onClick={() => window.open(document.attachment_url!, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            )}
            <div className="border-2 border-dashed rounded-md p-4 text-center">
              <input type="file" id="attachment" name="attachment" className="hidden" onChange={handleFileChange} />
              <label htmlFor="attachment" className="flex flex-col items-center justify-center cursor-pointer">
                <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : "Click to upload a new file (optional)"}
                </span>
                <span className="text-xs text-gray-500 mt-1">PDF, Images, and other documents (max 10MB)</span>
              </label>
              {selectedFile && (
                <div className="mt-2 text-sm text-green-600">New file selected: {selectedFile.name}</div>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1">* Uploaded documents can be viewed directly in the app</p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
