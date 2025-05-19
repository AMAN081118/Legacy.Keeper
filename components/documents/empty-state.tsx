"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

interface EmptyStateProps {
  onAddNew?: () => void
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FileText className="h-10 w-10 text-gray-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
      <p className="mt-2 text-sm text-gray-500">You haven't added any documents yet. Add one to get started.</p>
      {onAddNew && (
        <Button onClick={onAddNew} className="mt-6">
          <Plus className="mr-2 h-4 w-4" /> Add New Document
        </Button>
      )}
    </div>
  )
}
