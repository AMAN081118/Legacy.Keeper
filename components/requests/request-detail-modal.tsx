"use client"

import { X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { RequestData } from "@/types/request"
import Image from "next/image"

interface RequestDetailModalProps {
  request: RequestData
  isOpen: boolean
  onClose: () => void
  onReject: () => void
  onApprove: () => void
}

export function RequestDetailModal({ request, isOpen, onClose, onReject, onApprove }: RequestDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Request Received</DialogTitle>
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
              <Input id="request-title" value={request.title} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-date">Date</Label>
              <div className="relative">
                <Input id="request-date" value={request.date} readOnly />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-name">User Name</Label>
              <Input id="user-name" value={request.userName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-id">Email Id</Label>
              <Input id="email-id" value={request.email} readOnly />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select defaultValue={request.transactionType} disabled>
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
              <Select defaultValue={request.amount} disabled>
                <SelectTrigger id="amount">
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="₹2,000">₹2,000</SelectItem>
                  <SelectItem value="₹5,000">₹5,000</SelectItem>
                  <SelectItem value="₹10,000">₹10,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-details">Request Details</Label>
            <Textarea id="request-details" value={request.details} readOnly className="min-h-[100px] resize-none" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Input id="comment" value={request.comment} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Attachment</Label>
            <div className="overflow-hidden rounded-md border">
              <Image
                src={request.attachment || "/placeholder.svg"}
                alt="Request attachment"
                width={400}
                height={200}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button variant="destructive" onClick={onReject} className="sm:w-auto">
              Rejected
            </Button>
            <Button variant="default" onClick={onApprove} className="bg-green-600 hover:bg-green-700 sm:w-auto">
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
