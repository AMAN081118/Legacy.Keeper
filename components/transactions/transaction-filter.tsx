"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"

interface TransactionFilterProps {
  filters: {
    paymentMode: string
    dateRange: {
      from: Date | undefined
      to: Date | undefined
    }
  }
  onFilterChange: (filters: {
    paymentMode: string
    dateRange: {
      from: Date | undefined
      to: Date | undefined
    }
  }) => void
  onClose: () => void
}

export function TransactionFilter({ filters, onFilterChange, onClose }: TransactionFilterProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Payment Mode</Label>
        <Select
          value={localFilters.paymentMode}
          onValueChange={(value) => handleChange("paymentMode", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Date Range</Label>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateRange.from ? (
                  format(localFilters.dateRange.from, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.dateRange.from}
                onSelect={(date) => handleChange("dateRange", { ...localFilters.dateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !localFilters.dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateRange.to ? (
                  format(localFilters.dateRange.to, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.dateRange.to}
                onSelect={(date) => handleChange("dateRange", { ...localFilters.dateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Apply Filters</Button>
      </div>
    </div>
  )
}
