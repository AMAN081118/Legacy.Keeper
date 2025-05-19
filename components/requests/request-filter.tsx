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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-from"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? format(dateRange.from, "PPP") : <span>From date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-to"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.to && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.to ? format(dateRange.to, "PPP") : <span>To date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dateRange?.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    initialFocus
                    disabled={(date) => (dateRange?.from ? date < dateRange.from : false)}
                  />
                </PopoverContent>
              </Popover>
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
