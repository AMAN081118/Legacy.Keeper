"use client"

import { Button } from "@/components/ui/button"
import { UserCheck } from "lucide-react"

interface EmptyStateProps {
  onAddTrustee: () => void
}

export function EmptyState({ onAddTrustee }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="rounded-full bg-blue-50 p-3">
        <UserCheck className="h-6 w-6 text-blue-500" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No trustees added yet</h3>
      <p className="mt-2 text-sm text-gray-500">Add a trustee to manage your legacy in case of emergency.</p>
      <Button onClick={onAddTrustee} className="mt-4">
        + Add Trustee
      </Button>
    </div>
  )
}
