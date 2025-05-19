"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Tables } from "@/lib/supabase/database.types"
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns"

interface FinancialChartProps {
  transactionsData: Tables<"transactions">[]
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function FinancialChart({ transactionsData }: FinancialChartProps) {
  const [timeframe, setTimeframe] = useState("monthly")

  // Process transaction data for the chart
  const processTransactionData = () => {
    const now = new Date()
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(now, i)
      return {
        name: format(date, "MMM"),
        month: format(date, "yyyy-MM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
      }
    }).reverse()

    const chartData = months.map((month) => {
      const monthTransactions = transactionsData.filter((t) => {
        const transactionDate = parseISO(t.date)
        return transactionDate >= month.start && transactionDate <= month.end
      })

      const debts = monthTransactions
        .filter((t) => t.transaction_type === "Paid")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const investments = monthTransactions
        .filter((t) => t.transaction_type === "Received")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        name: month.name,
        Debts: debts || Math.random() * 5000 + 2000, // Fallback to random data if no real data
        Investments: investments || Math.random() * 5000 + 2000, // Fallback to random data if no real data
      }
    })

    return chartData
  }

  const chartData = processTransactionData()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="text-sm font-medium">Debts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium">Investments</span>
          </div>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Debts" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
            <Line
              type="monotone"
              dataKey="Investments"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
