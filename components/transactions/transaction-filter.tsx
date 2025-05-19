"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface TransactionFilterProps {
  filters: {
    paymentMode: string
    dateRange?: {
      from: Date | undefined
      to: Date | undefined
    }
  }
  onFilterChange: (filters: any) => void
  onClose: () => void
}

export function TransactionFilter({ filters, onFilterChange, onClose }: TransactionFilterProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: filters.dateRange?.from,
    to: filters.dateRange?.to,
  })

  const [paymentMode, setPaymentMode] = useState(filters.paymentMode)

  useEffect(() => {
    onFilterChange({
      ...filters,
      paymentMode,
      dateRange,
    })
  }, [paymentMode, dateRange])

  const handleReset = () => {
    setDateRange({ from: undefined, to: undefined })
    setPaymentMode("all")
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Payment Mode</h3>
        <Select value={paymentMode} onValueChange={setPaymentMode}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="card">Cards</SelectItem>
            <SelectItem value="app">Payment Apps</SelectItem>
            <SelectItem value="asset">Asset Based</SelectItem>
            <SelectItem value="other">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Date Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">From</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">To</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset
        </Button>
        <Button size="sm" onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
