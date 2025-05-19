"use client"

import type React from "react"

import { useState } from "react"
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

interface AddDebtLoanModalProps {
  isOpen: boolean
  onClose: () => void
  defaultType?: "Given" | "Received"
}

export function AddDebtLoanModal({ isOpen, onClose, defaultType = "Given" }: AddDebtLoanModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [transactionType, setTransactionType] = useState<"Given" | "Received">(defaultType)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [fileName, setFileName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      const formData = new FormData(e.currentTarget)
      const supabase = createClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      let attachmentUrl = ""

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

      // Add the debt/loan record
      const { error } = await supabase.from("debts_loans").insert({
        user_id: user.id,
        person: formData.get("person") as string,
        amount: Number.parseFloat(formData.get("amount") as string),
        interest: formData.get("interest") ? Number.parseFloat(formData.get("interest") as string) : null,
        amount_due: formData.get("amount_due") ? Number.parseFloat(formData.get("amount_due") as string) : null,
        start_date: startDate.toISOString(),
        due_date: dueDate ? dueDate.toISOString() : null,
        payment_mode: (formData.get("payment_mode") as string) || null,
        security: (formData.get("security") as string) || null,
        purpose: (formData.get("purpose") as string) || null,
        attachment_url: attachmentUrl || null,
        status: (formData.get("status") as string) || "Active",
        transaction_type: transactionType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw new Error(`Error adding debt/loan: ${error.message}`)

      toast({
        title: "Success",
        description: "Debt/loan entry added successfully.",
      })

      // Close the modal and refresh the page
      onClose()
      router.refresh()
    } catch (error: any) {
      console.error("Error adding debt/loan:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the entry.",
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
            <DialogTitle className="text-xl">Add New Debts and Loans</DialogTitle>
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
              <Input id="person" name="person" placeholder="Enter person name" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" placeholder="Enter amount" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Interest</Label>
              <Input id="interest" name="interest" type="number" placeholder="Enter interest amount" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount_due">Amount Due On</Label>
              <Input id="amount_due" name="amount_due" type="number" placeholder="Enter amount due" />
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
              <Select defaultValue="Active" name="status">
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
              <Select defaultValue="Online" name="payment_mode">
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
              <Input id="security" name="security" placeholder="Enter security details" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose/Description</Label>
            <Textarea
              id="purpose"
              name="purpose"
              placeholder="Enter purpose or description"
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment</Label>
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
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Browse Files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
                {fileName && <p className="text-xs mt-2 text-green-600">File selected: {fileName}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="sm:w-auto" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
