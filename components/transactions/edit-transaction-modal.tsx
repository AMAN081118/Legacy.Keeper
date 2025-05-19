"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Calendar, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"
import { uploadFile, updateTransactionAttachment } from "@/app/actions/upload"
import { toast } from "@/components/ui/use-toast"

interface EditTransactionModalProps {
  transaction: Tables<"transactions">
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Tables<"transactions">) => void
}

export function EditTransactionModal({ transaction, isOpen, onClose, onSave }: EditTransactionModalProps) {
  const [editedTransaction, setEditedTransaction] = useState<Tables<"transactions">>(transaction)
  const [date, setDate] = useState<Date>(parseISO(transaction.date))
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [existingAttachment, setExistingAttachment] = useState(transaction.attachment_url)

  useEffect(() => {
    setEditedTransaction(transaction)
    setDate(parseISO(transaction.date))
    setExistingAttachment(transaction.attachment_url)
  }, [transaction])

  const handleInputChange = (field: keyof Tables<"transactions">, value: any) => {
    setEditedTransaction((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      handleInputChange("date", selectedDate.toISOString())
    }
  }

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const supabase = createClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      // Ensure the bucket exists
      const bucketExists = await ensureBucketExists("user_documents")
      if (!bucketExists) {
        throw new Error("Could not access or create storage bucket")
      }

      // Generate file path
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `transaction_receipts/${fileName}`

      // Convert file to ArrayBuffer for server upload
      const arrayBuffer = await file.arrayBuffer()

      // Use server action to upload file
      const result = await uploadFile("user_documents", filePath, arrayBuffer, file.type)

      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to upload file")
      }

      return result.url
    } catch (error: any) {
      console.error("Error uploading file:", error)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFileName(file.name)
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    try {
      if (selectedFile) {
        const fileUrl = await handleFileUpload(selectedFile)
        if (fileUrl) {
          editedTransaction.attachment_url = fileUrl
        }
      } else if (existingAttachment === null && transaction.attachment_url) {
        // If attachment was removed, update the transaction record
        await updateTransactionAttachment(transaction.id, null)
      }

      onSave(editedTransaction)
    } catch (error: any) {
      console.error("Error submitting transaction:", error)
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAttachment = () => {
    setExistingAttachment(null)
    setEditedTransaction((prev) => ({
      ...prev,
      attachment_url: null,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Edit Transaction</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-name">Transaction Name</Label>
              <Input
                id="transaction-name"
                value={editedTransaction.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="person-party">Person/Party</Label>
              <Input
                id="person-party"
                value={editedTransaction.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select
                value={editedTransaction.transaction_type}
                onValueChange={(value) => handleInputChange("transaction_type", value)}
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-mode">Payment Mode</Label>
              <Select
                value={editedTransaction.payment_mode || ""}
                onValueChange={(value) => handleInputChange("payment_mode", value)}
              >
                <SelectTrigger id="payment-mode">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Phone Pay">Phone Pay</SelectItem>
                  <SelectItem value="Google Pay">Google Pay</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={editedTransaction.amount.toString()}
                onChange={(e) => handleInputChange("amount", Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTransaction.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter transaction details here"
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt/Invoice</Label>
            {existingAttachment ? (
              <div className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Attached Receipt</p>
                      <a
                        href={existingAttachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Attachment
                      </a>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveAttachment} className="text-red-500">
                    Remove
                  </Button>
                </div>
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
                    onClick={() => document.getElementById("file-upload-edit")?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Browse Files"}
                  </Button>
                  <input
                    id="file-upload-edit"
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
            <Button
              variant="default"
              onClick={handleSubmit}
              className="sm:w-auto"
              disabled={uploading || !editedTransaction.name || !editedTransaction.amount}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
