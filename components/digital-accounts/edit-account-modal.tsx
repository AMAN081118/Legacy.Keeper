"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { updateDigitalAccount } from "@/app/actions/digital-accounts"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DigitalAccount } from "@/lib/supabase/database.types"

interface EditAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  account: DigitalAccount
  userId: string
}

export function EditAccountModal({ isOpen, onClose, onSuccess, account, userId }: EditAccountModalProps) {
  const [accountName, setAccountName] = useState("")
  const [accountIdNo, setAccountIdNo] = useState("")
  const [passwordPhone, setPasswordPhone] = useState("")
  const [loginContact, setLoginContact] = useState("")
  const [description, setDescription] = useState("")
  const [governmentIdUrl, setGovernmentIdUrl] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (account) {
      setAccountName(account.account_name || "")
      setAccountIdNo(account.account_id_no || "")
      setPasswordPhone(account.password_phone || "")
      setLoginContact(account.login_contact || "")
      setDescription(account.description || "")
      setGovernmentIdUrl(account.government_id_url)
      setDate(account.date ? new Date(account.date) : undefined)
    }
  }, [account])

  const handleSubmit = async () => {
    if (!accountName) {
      toast({
        title: "Error",
        description: "Account name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', accountName)
      formData.append('type', 'digital')
      formData.append('account_id', accountIdNo)
      formData.append('password', passwordPhone)
      formData.append('contact_info', loginContact)
      formData.append('description', description || '')
      formData.append('government_id_url', governmentIdUrl || '')
      if (date) {
        formData.append('date', date.toISOString())
      }
      formData.append('user_id', userId)
      formData.append('id', account.id)

      const result = await updateDigitalAccount(formData)

      if (result.success) {
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update account",
          variant: "destructive",
        })
      }
    } catch (error) {
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>Update your digital account details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g., Gmail, Facebook, Bank Account"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="accountIdNo">Account ID/No</Label>
            <Input
              id="accountIdNo"
              value={accountIdNo}
              onChange={(e) => setAccountIdNo(e.target.value)}
              placeholder="e.g., Account number, Username"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="passwordPhone">Password/Phone Number</Label>
            <Input
              id="passwordPhone"
              type="text"
              value={passwordPhone}
              onChange={(e) => setPasswordPhone(e.target.value)}
              placeholder="Enter password or phone number"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="loginContact">Login/Contact Information</Label>
            <Input
              id="loginContact"
              value={loginContact}
              onChange={(e) => setLoginContact(e.target.value)}
              placeholder="e.g., Email, Recovery phone"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional notes or details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label>Government ID</Label>
            <FileUpload
              bucket="digital-accounts"
              onUploadComplete={setGovernmentIdUrl}
              accept="image/*,.pdf"
            />
            {governmentIdUrl && (
              <a
                href={governmentIdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 underline"
              >
                View Current File
              </a>
            )}
            <p className="text-xs text-muted-foreground">Supported formats: PDF, JPG, JPEG, PNG</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
