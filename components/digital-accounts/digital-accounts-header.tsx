"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plus, Search } from "lucide-react"

interface DigitalAccountsHeaderProps {
  onAddNew: () => void
  onSearch: (query: string) => void
  searchQuery: string
}

export function DigitalAccountsHeader({ onAddNew, onSearch, searchQuery }: DigitalAccountsHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground">View Account Details Here!!</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Accounts and Password ({searchQuery ? "Filtered" : "All"})</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={onAddNew} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>

          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search accounts..."
          className="w-full pl-8"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  )
}
