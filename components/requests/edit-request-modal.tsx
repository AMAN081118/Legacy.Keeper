"use client"

import { useState } from "react"
import { X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RequestData } from "@/types/request"
import Image from "next/image"

interface EditRequestModalProps {
  request: RequestData
  isOpen: boolean
  onClose: () => void
  onSave: (updatedRequest: RequestData) => void
}

export function EditRequestModal({ request, isOpen, onClose, onSave }: EditRequestModalProps) {
  const [editedRequest, setEditedRequest] = useState<RequestData>({ ...request })

  const handleChange = (field: keyof RequestData, value: string) => {
    setEditedRequest((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    onSave(editedRequest)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Edit Request</DialogTitle>
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
              <div className="relative">
                <Input
                  id="request-date"
                  value={editedRequest.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
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
            <Label>Attachment</Label>
            <div className="overflow-hidden rounded-md border">
              <Image
                src={editedRequest.attachment || "/placeholder.svg"}
                alt="Request attachment"
                width={400}
                height={200}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onClose} className="sm:w-auto">
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} className="sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
