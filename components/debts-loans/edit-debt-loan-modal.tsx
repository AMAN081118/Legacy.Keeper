"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { DebtLoan } from "@/lib/supabase/database.types"

interface EditDebtLoanModalProps {
  isOpen: boolean
  onClose: () => void
  debtLoan: DebtLoan
}

export function EditDebtLoanModal({ isOpen, onClose, debtLoan }: EditDebtLoanModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<"Given" | "Received">(debtLoan.transaction_type)
  const [startDate, setStartDate] = useState<Date>(new Date(debtLoan.start_date))
  const [dueDate, setDueDate] = useState<Date | undefined>(debtLoan.due_date ? new Date(debtLoan.due_date) : undefined)
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    person: debtLoan.person,
    amount: debtLoan.amount.toString(),
    interest: debtLoan.interest?.toString() || "",
    amount_due: debtLoan.amount_due?.toString() || "",
    payment_mode: debtLoan.payment_mode || "Online",
    security: debtLoan.security || "",
    purpose: debtLoan.purpose || "",
    status: debtLoan.status,
    attachment_url: debtLoan.attachment_url || "",
  })

  useEffect(() => {
    // Update form data when debtLoan changes
    setFormData({
      person: debtLoan.person,
      amount: debtLoan.amount.toString(),
      interest: debtLoan.interest?.toString() || "",
      amount_due: debtLoan.amount_due?.toString() || "",
      payment_mode: debtLoan.payment_mode || "Online",
      security: debtLoan.security || "",
      purpose: debtLoan.purpose || "",
      status: debtLoan.status,
      attachment_url: debtLoan.attachment_url || "",
    })
    setTransactionType(debtLoan.transaction_type)
    setStartDate(new Date(debtLoan.start_date))
    setDueDate(debtLoan.due_date ? new Date(debtLoan.due_date) : undefined)
  }, [debtLoan])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFileName(file.name)
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      let attachmentUrl = formData.attachment_url

      // Upload file if selected
      if (selectedFile) {
        // Generate a unique file path
        const fileExt = selectedFile.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from("debts_loans_documents")
          .upload(filePath, selectedFile)

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`)
        }

        // Get the public URL
        const { data: urlData } = supabase.storage.from("debts_loans_documents").getPublicUrl(filePath)
        attachmentUrl = urlData.publicUrl
      }

      // Update the debt/loan record
      const { error } = await supabase
        .from("debts_loans")
        .update({
          person: formData.person,
          amount: Number.parseFloat(formData.amount),
          interest: formData.interest ? Number.parseFloat(formData.interest) : null,
          amount_due: formData.amount_due ? Number.parseFloat(formData.amount_due) : null,
          start_date: startDate.toISOString(),
          due_date: dueDate ? dueDate.toISOString() : null,
          payment_mode: formData.payment_mode,
          security: formData.security || null,
          purpose: formData.purpose || null,
          attachment_url: attachmentUrl,
          status: formData.status,
          transaction_type: transactionType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", debtLoan.id)

      if (error) throw new Error(`Error updating debt/loan: ${error.message}`)

      toast({
        title: "Success",
        description: "Debt/loan entry updated successfully.",
      })

      // Close the modal and refresh the page
      onClose()
      router.refresh()
    } catch (error: any) {
      console.error("Error updating debt/loan:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the entry.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Edit Debt/Loan Entry</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Money Given/Received</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => setTransactionType(value as "Given" | "Received")}
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Given">Given</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="person">Person</Label>
              <Input
                id="person"
                name="person"
                value={formData.person}
                onChange={handleChange}
                placeholder="Enter person name"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Interest</Label>
              <Input
                id="interest"
                name="interest"
                type="number"
                value={formData.interest}
                onChange={handleChange}
                placeholder="Enter interest amount"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount_due">Amount Due On</Label>
              <Input
                id="amount_due"
                name="amount_due"
                type="number"
                value={formData.amount_due}
                onChange={handleChange}
                placeholder="Enter amount due"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start_date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due_date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode</Label>
              <Select
                value={formData.payment_mode}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, payment_mode: value }))}
              >
                <SelectTrigger id="payment_mode">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Inhand">Inhand</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security">Security</Label>
              <Input
                id="security"
                name="security"
                value={formData.security}
                onChange={handleChange}
                placeholder="Enter security details"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose/Description</Label>
            <Textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Enter purpose or description"
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment</Label>
            {formData.attachment_url && (
              <div className="mb-2">
                <p className="text-sm">
                  Current attachment:
                  <a
                    href={formData.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </p>
              </div>
            )}
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
                >
                  Browse Files
                </Button>
                <input
                  id="file-upload-edit"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
                {fileName && <p className="text-xs mt-2 text-green-600">New file selected: {fileName}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="sm:w-auto" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
