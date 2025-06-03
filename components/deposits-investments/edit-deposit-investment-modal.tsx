"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { updateDepositInvestment } from "@/app/actions/deposits-investments"
import { useToast } from "@/components/ui/use-toast"
import type { DepositInvestment } from "@/lib/supabase/database.types"

interface EditDepositInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
  depositInvestment: DepositInvestment
}

export function EditDepositInvestmentModal({
  isOpen,
  onClose,
  onSuccess,
  depositInvestment,
}: EditDepositInvestmentModalProps) {
  const [name, setName] = useState(depositInvestment.name)
  const [amount, setAmount] = useState(depositInvestment.amount.toString())
  const [investmentType, setInvestmentType] = useState<string>(depositInvestment.investment_type)
  const [description, setDescription] = useState(depositInvestment.description || "")
  const [paidTo, setPaidTo] = useState(depositInvestment.paid_to || "")
  const [date, setDate] = useState<Date | undefined>(
    depositInvestment.date ? new Date(depositInvestment.date) : undefined,
  )
  const [maturityDate, setMaturityDate] = useState<Date | undefined>(
    depositInvestment.maturity_date ? new Date(depositInvestment.maturity_date) : undefined,
  )
  const [interestRate, setInterestRate] = useState(
    depositInvestment.interest_rate !== null ? depositInvestment.interest_rate.toString() : "",
  )
  const [expectedReturns, setExpectedReturns] = useState(
    depositInvestment.expected_returns !== null ? depositInvestment.expected_returns.toString() : "",
  )
  const [status, setStatus] = useState<string>(depositInvestment.status)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [removeAttachment, setRemoveAttachment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Update state when depositInvestment changes
  useEffect(() => {
    setName(depositInvestment.name)
    setAmount(depositInvestment.amount.toString())
    setInvestmentType(depositInvestment.investment_type)
    setDescription(depositInvestment.description || "")
    setPaidTo(depositInvestment.paid_to || "")
    setDate(depositInvestment.date ? new Date(depositInvestment.date) : undefined)
    setMaturityDate(depositInvestment.maturity_date ? new Date(depositInvestment.maturity_date) : undefined)
    setInterestRate(depositInvestment.interest_rate !== null ? depositInvestment.interest_rate.toString() : "")
    setExpectedReturns(depositInvestment.expected_returns !== null ? depositInvestment.expected_returns.toString() : "")
    setStatus(depositInvestment.status)
    setAttachment(null)
    setRemoveAttachment(false)
  }, [depositInvestment])

  const handleRemoveAttachment = () => {
    setAttachment(null)
    setRemoveAttachment(true)
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
      if (attachment && attachment.size > 0) {
        formData.append("attachment", attachment)
      }
      if (removeAttachment) {
        formData.append("removeAttachment", "true")
      }

      const result = await updateDepositInvestment(depositInvestment.id, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Deposit/Investment updated successfully",
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update deposit/investment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating deposit/investment:", error)
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Investment or Deposit</DialogTitle>
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
            {attachment && attachment.size > 0 ? (
              <div className="border rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xs font-medium">{attachment.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={handleRemoveAttachment}
                >
                  Remove
                </Button>
              </div>
            ) : depositInvestment.attachment_url && !removeAttachment ? (
              <div className="border rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <a
                    href={depositInvestment.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View current attachment
                  </a>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={handleRemoveAttachment}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <FileUpload
                onFileChange={(file) => setAttachment(file)}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                maxSize={5 * 1024 * 1024}
              />
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
