"use client"

import { useState } from "react"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { FilterOptions } from "@/types/request"

interface RequestFilterProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  onClose?: () => void
}

export function RequestFilter({ filters, onFilterChange, onClose }: RequestFilterProps) {
  const [status, setStatus] = useState<FilterOptions["status"]>(filters.status)
  const [dateRange, setDateRange] = useState<FilterOptions["dateRange"]>(
    filters.dateRange || {
      from: undefined,
      to: undefined,
    },
  )

  const handleApplyFilters = () => {
    onFilterChange({
      status,
      dateRange,
    })
    if (onClose) onClose()
  }

  const handleResetFilters = () => {
    setStatus("all")
    setDateRange({
      from: undefined,
      to: undefined,
    })
    onFilterChange({
      status: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    })
    if (onClose) onClose()
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </label>
          <Select value={status} onValueChange={(value) => setStatus(value as FilterOptions["status"])}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="grid gap-2">
            <div className="grid gap-2">
              <input
                id="date-from"
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
                value={dateRange?.from ? dateRange.from.toISOString().split("T")[0] : ""}
                onChange={e => {
                  const val = e.target.value ? new Date(e.target.value) : undefined;
                  setDateRange(prev => ({
                    from: val,
                    to: prev?.to
                  }))
                }}
                placeholder="From date"
              />
            </div>
            <div className="grid gap-2">
              <input
                id="date-to"
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                min={dateRange?.from ? dateRange.from.toISOString().split("T")[0] : "1900-01-01"}
                max={new Date().toISOString().split("T")[0]}
                value={dateRange?.to ? dateRange.to.toISOString().split("T")[0] : ""}
                onChange={e => {
                  const val = e.target.value ? new Date(e.target.value) : undefined;
                  setDateRange(prev => ({
                    from: prev?.from,
                    to: val
                  }))
                }}
                placeholder="To date"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}
