"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import type { DebtLoan } from "@/lib/supabase/database.types"

interface DebtsLoansFilterProps {
  originalData: DebtLoan[]
  onFilter: (filtered: DebtLoan[]) => void
}

export function DebtsLoansFilter({ originalData, onFilter }: DebtsLoansFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentModeFilter, setPaymentModeFilter] = useState("all")
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const filtered = originalData.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.purpose && item.purpose.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || item.status === statusFilter

      const matchesPaymentMode = paymentModeFilter === "all" || item.payment_mode === paymentModeFilter

      return matchesSearch && matchesStatus && matchesPaymentMode
    })

    onFilter(filtered)
  }, [searchTerm, statusFilter, paymentModeFilter, originalData, onFilter])

  const handleReset = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentModeFilter("all")
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by person or purpose..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <Filter className="mr-2 h-4 w-4" />
            <span>Status</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Defaulted">Defaulted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <span>Payment Mode</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Online">Online</SelectItem>
            <SelectItem value="Inhand">Inhand</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
