"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download } from "lucide-react"

interface TrusteesHeaderProps {
  onAddTrustee: () => void
  onSearch: (query: string) => void
  searchQuery: string
  canAddTrustee: boolean
}

export function TrusteesHeader({ onAddTrustee, onSearch, searchQuery, canAddTrustee }: TrusteesHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trustees</h1>
        {canAddTrustee && <Button onClick={onAddTrustee}>+ Add Trustee</Button>}
      </div>
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
          <span className="sr-only">Download</span>
        </Button>
      </div>
    </div>
  )
}
