"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ApprovalNotesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ApprovalNotesModal({ isOpen, onClose, onConfirm }: ApprovalNotesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:rounded-lg">
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Approval Notes</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Approval Notes</p>
            <Textarea placeholder="Enter Approval Notes" className="min-h-[120px] resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" onClick={onConfirm} className="bg-[#0a2642] hover:bg-[#0a2642]/90">
              Confirm Approval
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
