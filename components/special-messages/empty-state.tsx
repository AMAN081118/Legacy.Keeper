"use client"

import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"

interface EmptyStateProps {
  onCreateMessage: () => void
}

export function EmptyState({ onCreateMessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-gray-50">
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <MessageSquarePlus className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
        Create your first message to share important information with other users.
      </p>
      <Button onClick={onCreateMessage} className="bg-[#0a2642] hover:bg-[#0a2642]/90">
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        Create New Message
      </Button>
    </div>
  )
}
