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
import { addDocument } from "@/app/actions/documents"
import type { Document } from "@/lib/supabase/database.types"
import { useToast } from "@/components/ui/use-toast"

interface AddDocumentModalProps {
  open: boolean
  onClose: () => void
  onAdd: (document: Document) => void
  userId: string
}

export function AddDocumentModal({ open, onClose, onAdd, userId }: AddDocumentModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [documentType, setDocumentType] = useState("PDF")
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
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please upload a document file.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const result = await addDocument({
        userId,
        title,
        description,
        documentType,
        file,
      })

      if (result.success && result.data) {
        onAdd(result.data)
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add document. Please try again.",
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
          <DialogTitle>Add New Documents Store</DialogTitle>
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
              <div className="col-span-3">
                <FileUpload
                  bucket="documents"
                  onFileChange={setFile}
                  maxSize={10}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
