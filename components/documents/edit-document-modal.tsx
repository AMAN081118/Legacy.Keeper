"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/file-upload"
import { updateDocument } from "@/app/actions/documents"
import type { Document } from "@/lib/supabase/database.types"
import { useToast } from "@/components/ui/use-toast"

interface EditDocumentModalProps {
  open: boolean
  onClose: () => void
  onUpdate: (document: Document) => void
  document: Document
}

export function EditDocumentModal({ open, onClose, onUpdate, document }: EditDocumentModalProps) {
  const [title, setTitle] = useState(document.title)
  const [description, setDescription] = useState(document.description || "")
  const [documentType, setDocumentType] = useState(document.document_type)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      toast({
        title: "Missing information",
        description: "Please provide a document title.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Always pass the file if present, so the backend uploads and updates the DB
      const result = await updateDocument({
        id: document.id,
        title,
        description,
        documentType,
        file, // If file is not null, backend will upload and update DB
      })

      if (result.success && result.data) {
        onUpdate(result.data)
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update document. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Document Title
              </Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Document Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Document Type
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Doc">Doc</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Attach Documents</Label>
              <div className="col-span-3 space-y-2">
                <FileUpload onFileChange={setFile} maxSize={10} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                {document.attachment_url && !file && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <a
                      href={document.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View current file
                    </a>
                  </div>
                )}
                {file && (
                  <div className="text-xs text-green-600">Selected: {file.name}</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
