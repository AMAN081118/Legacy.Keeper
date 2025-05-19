"use client"

import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

interface EmptyStateProps {
  onAddNominee: () => void
}

export function EmptyState({ onAddNominee }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
      <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <UserPlus className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No nominees yet</h3>
      <p className="text-gray-500 text-center max-w-sm mt-2">
        Add nominees to manage who will have access to your information in case of emergency.
      </p>
      <Button onClick={onAddNominee} className="mt-6">
        <UserPlus className="mr-2 h-4 w-4" />
        Add Nominee
      </Button>
    </div>
  )
}
