"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  type: "approved" | "rejected"
  onClose: () => void
}

export function ConfirmationModal({ isOpen, type, onClose }: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center sm:rounded-lg">
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 py-10">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold">
            Request Successfully {type === "approved" ? "Approved" : "Rejected"}
          </h3>
        </div>
      </DialogContent>
    </Dialog>
  )
}
