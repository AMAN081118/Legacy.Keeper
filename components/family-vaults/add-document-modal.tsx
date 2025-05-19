"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addFamilyDocument } from "@/app/actions/family-vaults"
import { useToast } from "@/components/ui/use-toast"
import { FileUp, Loader2 } from "lucide-react"

interface AddDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  familyMemberId: string
}

export function AddDocumentModal({ isOpen, onClose, familyMemberId }: AddDocumentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("familyMemberId", familyMemberId)

      const result = await addFamilyDocument(familyMemberId, formData)

      if (result.success) {
        toast({
          title: "Document added",
          description: "The document has been added successfully.",
        })
        onClose()
        // Refresh the page to show the new document
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add document. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding document:", error)
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentTitle">Document Title</Label>
            <Input id="documentTitle" name="documentTitle" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentCategory">Document Category</Label>
            <Input id="documentCategory" name="documentCategory" placeholder="e.g., Government ID, Certificate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentDate">Document Date</Label>
            <Input id="documentDate" name="documentDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachment">Attach Document</Label>
            <div className="border-2 border-dashed rounded-md p-4 text-center">
              <input type="file" id="attachment" name="attachment" className="hidden" onChange={handleFileChange} />
              <label htmlFor="attachment" className="flex flex-col items-center justify-center cursor-pointer">
                <FileUp className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </span>
                <span className="text-xs text-gray-500 mt-1">PDF, Images, and other documents (max 10MB)</span>
              </label>
              {selectedFile && <div className="mt-2 text-sm text-green-600">File selected: {selectedFile.name}</div>}
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
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
