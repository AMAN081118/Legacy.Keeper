"use client"

import type React from "react"

import { useState } from "react"
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
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"
import { uploadFile } from "@/app/actions/upload"
import { toast } from "@/components/ui/use-toast"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Partial<Tables<"transactions">>) => void
}

export function AddTransactionModal({ isOpen, onClose, onSave }: AddTransactionModalProps) {
  const [transaction, setTransaction] = useState<Partial<Tables<"transactions">>>({
    name: "",
    amount: 0,
    transaction_type: "Paid",
    payment_mode: "Phone Pay",
    date: new Date().toISOString(),
    description: "",
  })
  const [date, setDate] = useState<Date>(new Date())
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (field: keyof Tables<"transactions">, value: any) => {
    setTransaction((prev) => ({
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

  const handleSubmit = async () => {
    try {
      if (selectedFile) {
        const fileUrl = await handleFileUpload(selectedFile)
        if (fileUrl) {
          transaction.attachment_url = fileUrl
        }
      }
      onSave(transaction)
    } catch (error: any) {
      console.error("Error submitting transaction:", error)
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Add New Transaction</DialogTitle>
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
                value={transaction.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Netflix Subscription"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={transaction.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select
                value={transaction.transaction_type}
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
                value={transaction.payment_mode || ""}
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={transaction.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Add any additional details about the transaction"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="flex-1"
              />
              {fileName && (
                <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {fileName && <p className="text-sm text-muted-foreground">{fileName}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
