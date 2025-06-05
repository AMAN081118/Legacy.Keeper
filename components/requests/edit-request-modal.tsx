"use client"

import { useState, useEffect } from "react"
import { X, Calendar as CalendarIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RequestData } from "@/types/request"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"
import { uploadFile } from "@/app/actions/upload"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isValid } from "date-fns"
import { cn } from "@/lib/utils"

interface EditRequestModalProps {
  request: RequestData
  isOpen: boolean
  onClose: () => void
  onSave: (updatedRequest: RequestData) => void
  mode?: 'add' | 'edit'
}

export function EditRequestModal({ request, isOpen, onClose, onSave, mode = 'edit' }: EditRequestModalProps) {
  const initialRequest = {
    ...request,
    userName: request.userName || "",
    email: request.email || "",
    transactionType: request.transactionType || "",
    details: request.details || "",
    comment: request.comment || "",
    attachment: request.attachment || "",
  }
  const [editedRequest, setEditedRequest] = useState<RequestData>(initialRequest)
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dateObj, setDateObj] = useState<Date | undefined>(
    editedRequest.date && isValid(new Date(editedRequest.date)) ? new Date(editedRequest.date) : undefined
  )
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  const handleChange = (field: keyof RequestData, value: string) => {
    setEditedRequest((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFileName(file.name)
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const bucketExists = await ensureBucketExists("requests")
      if (!bucketExists) throw new Error("Could not access or create storage bucket")
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `request_attachments/${fileName}`
      const arrayBuffer = await file.arrayBuffer()
      const result = await uploadFile("requests", filePath, arrayBuffer, file.type)
      if (!result.success || !result.url) throw new Error(result.error || "Failed to upload file")
      return result.url
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during file upload",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAttachment = () => {
    setEditedRequest((prev) => ({ ...prev, attachment: "" }))
    setFileName("")
    setSelectedFile(null)
  }

  const handleSave = async () => {
    let attachmentUrl = editedRequest.attachment
    if (selectedFile) {
      const url = await handleFileUpload(selectedFile)
      if (url) {
        attachmentUrl = url
      }
    }
    onSave({ ...editedRequest, attachment: attachmentUrl })
    onClose()
  }

  useEffect(() => {
    if (dateObj) {
      setEditedRequest((prev) => ({ ...prev, date: dateObj.toISOString().split("T")[0] }))
    }
  }, [dateObj])

  const handleDateSelect = (date: Date | undefined) => {
    setDateObj(date)
    setDatePopoverOpen(false)
  }

  const handleClearDate = () => {
    setDateObj(undefined)
    setEditedRequest((prev) => ({ ...prev, date: "" }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{mode === 'add' ? 'Add Request' : 'Edit Request'}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="request-title">Request Title</Label>
              <Input
                id="request-title"
                value={editedRequest.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-date">Date</Label>
              <Input
                id="request-date"
                name="request-date"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                min="1900-01-01"
                value={editedRequest.date || ""}
                onChange={e => handleChange("date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-name">User Name</Label>
              <Input
                id="user-name"
                value={editedRequest.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-id">Email Id</Label>
              <Input
                id="email-id"
                value={editedRequest.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select
                value={editedRequest.transactionType}
                onValueChange={(value) => handleChange("transactionType", value)}
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Debt">Debt</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                  <SelectItem value="Loan">Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={editedRequest.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-details">Request Details</Label>
            <Textarea
              id="request-details"
              value={editedRequest.details}
              onChange={(e) => handleChange("details", e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              value={editedRequest.comment}
              onChange={(e) => handleChange("comment", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment</Label>
            {editedRequest.attachment ? (
              <div className="flex items-center gap-2 border rounded-md p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => window.open(editedRequest.attachment, "_blank")}
                >
                  View Attachment
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#0a2642] text-white hover:bg-[#0a2642]/90"
                  onClick={() => document.getElementById("file-upload-request")?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload New Attachment"}
                </Button>
                <input
                  id="file-upload-request"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
                {fileName && <p className="text-xs mt-2 text-green-600">File selected: {fileName}</p>}
              </div>
            ) : (
              <div className="border-2 border-dashed border-blue-300 rounded-md p-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drag & Drop files here</p>
                  <p className="text-xs text-muted-foreground mt-1">Supported format : pdf, jpg, jpeg.</p>
                  <p className="text-xs text-muted-foreground mt-1">Or</p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2 bg-[#0a2642] text-white hover:bg-[#0a2642]/90"
                    onClick={() => document.getElementById("file-upload-request")?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Browse Files"}
                  </Button>
                  <input
                    id="file-upload-request"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={handleFileChange}
                  />
                  {fileName && <p className="text-xs mt-2 text-green-600">File selected: {fileName}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} className="sm:w-auto">
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} className="sm:w-auto" disabled={uploading}>
              {mode === 'add' ? 'Add Request' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
