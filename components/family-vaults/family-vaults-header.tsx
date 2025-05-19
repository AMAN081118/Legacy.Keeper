"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface FamilyVaultsHeaderProps {
  title: string
  subtitle?: string
  onAddClick?: () => void
  addButtonText?: string
  showAddButton?: boolean
}

export function FamilyVaultsHeader({
  title,
  subtitle,
  onAddClick,
  addButtonText = "Add New Member",
  showAddButton = true,
}: FamilyVaultsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {showAddButton && (
        <Button onClick={onAddClick} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> {addButtonText}
        </Button>
      )}
    </div>
  )
}
