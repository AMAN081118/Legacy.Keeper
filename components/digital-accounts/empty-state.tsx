"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  onAddNew: () => void
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-[400px] border rounded-lg bg-background">
      <div className="mb-4">
        <img src="/placeholder-ae5ka.png" alt="No accounts" className="mx-auto h-40 w-40" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No Accounts Found</h3>
      <p className="mb-6 text-muted-foreground max-w-md">
        You haven't added any digital accounts yet. Add your first account to keep track of your important login details
        securely.
      </p>
      <Button onClick={onAddNew}>
        <Plus className="mr-2 h-4 w-4" />
        Add New Account
      </Button>
    </div>
  )
}
