"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

interface DocumentsHeaderProps {
  onAddNew: () => void
  onSearch: (query: string) => void
  searchQuery: string
  documentsCount: number
}

export function DocumentsHeader({ onAddNew, onSearch, searchQuery, documentsCount }: DocumentsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Documents Store({documentsCount})</h1>
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add New Documents Store
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" value={searchQuery} onChange={(e) => onSearch(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
