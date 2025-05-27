"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/file-upload"
import { addDepositInvestment } from "@/app/actions/deposits-investments"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"

interface AddDepositInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
}

export function AddDepositInvestmentModal({ isOpen, onClose, onSuccess }: AddDepositInvestmentModalProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [investmentType, setInvestmentType] = useState<string>("")
  const [description, setDescription] = useState("")
  const [paidTo, setPaidTo] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [maturityDate, setMaturityDate] = useState<Date | undefined>(undefined)
  const [interestRate, setInterestRate] = useState("")
  const [expectedReturns, setExpectedReturns] = useState("")
  const [status, setStatus] = useState<string>("Active")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberDetails, setRememberDetails] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setName("")
    setAmount("")
    setInvestmentType("")
    setDescription("")
    setPaidTo("")
    setDate(new Date())
    setMaturityDate(undefined)
    setInterestRate("")
    setExpectedReturns("")
    setStatus("Active")
    setAttachment(null)
    setRememberDetails(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("amount", amount)
      formData.append("investmentType", investmentType)
      formData.append("description", description)
      formData.append("paidTo", paidTo)
      formData.append("date", date ? date.toISOString() : new Date().toISOString())
      if (maturityDate) {
        formData.append("maturityDate", maturityDate.toISOString())
      }
      if (interestRate) {
        formData.append("interestRate", interestRate)
      }
      if (expectedReturns) {
        formData.append("expectedReturns", expectedReturns)
      }
      formData.append("status", status)
      if (attachment) {
        formData.append("attachment", attachment)
      }

      const result = await addDepositInvestment(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Deposit/Investment added successfully",
        })
        if (!rememberDetails) {
          resetForm()
        }
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add deposit/investment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding deposit/investment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Investments or Deposit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Investment Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investmentType">Investment Type</Label>
              <Select value={investmentType} onValueChange={setInvestmentType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Shares">Shares</SelectItem>
                  <SelectItem value="Bond">Bond</SelectItem>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="DigitalAsset">Digital Asset</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Do you want to remember on this</Label>
            <RadioGroup
              defaultValue="no"
              className="flex space-x-4"
              value={rememberDetails ? "yes" : "no"}
              onValueChange={(value) => setRememberDetails(value === "yes")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidTo">Paid to</Label>
              <Input id="paidTo" value={paidTo} onChange={(e) => setPaidTo(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Investment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Maturity Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !maturityDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {maturityDate ? format(maturityDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={maturityDate} onSelect={setMaturityDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%) (Optional)</Label>
              <Input
                id="interestRate"
                type="number"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedReturns">Expected Returns (Optional)</Label>
              <Input
                id="expectedReturns"
                type="number"
                min="0"
                step="0.01"
                value={expectedReturns}
                onChange={(e) => setExpectedReturns(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Matured">Matured</SelectItem>
                <SelectItem value="Withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Investment Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter details about this investment"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment</Label>
            <FileUpload
              onFileChange={(file) => setAttachment(file)}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
