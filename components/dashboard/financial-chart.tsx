"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Tables } from "@/lib/supabase/database.types"
import { format, parseISO, subMonths, startOfMonth, endOfMonth, subWeeks, startOfWeek, endOfWeek, subYears, startOfYear, endOfYear } from "date-fns"

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
    let periods: { name: string; start: Date; end: Date }[] = []

    if (timeframe === "weekly") {
      // Get last 12 weeks
      periods = Array.from({ length: 12 }, (_, i) => {
        const date = subWeeks(now, i)
        const start = startOfWeek(date, { weekStartsOn: 1 }) // Start from Monday
        const end = endOfWeek(date, { weekStartsOn: 1 })
        return {
          name: `Week ${12 - i}`,
          start,
          end,
        }
      }).reverse()
    } else if (timeframe === "monthly") {
      // Get last 12 months
      periods = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(now, i)
      return {
        name: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
      }
    }).reverse()
    } else if (timeframe === "yearly") {
      // Get last 5 years
      periods = Array.from({ length: 5 }, (_, i) => {
        const date = subYears(now, i)
        return {
          name: format(date, "yyyy"),
          start: startOfYear(date),
          end: endOfYear(date),
        }
      }).reverse()
    }

    const chartData = periods.map((period) => {
      const periodTransactions = transactionsData.filter((t) => {
        const transactionDate = parseISO(t.date)
        return transactionDate >= period.start && transactionDate <= period.end
      })

      // Calculate different types of transactions
      const income = periodTransactions
        .filter((t) => t.transaction_type === "Received")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const expenses = periodTransactions
        .filter((t) => t.transaction_type === "Paid")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        name: period.name,
        Received: income,
        Paid: expenses,
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
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium">Received</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="text-sm font-medium">Paid</span>
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
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => {
                if (timeframe === "weekly") {
                  return `W${value.split(" ")[1]}`
                }
                return value
              }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => {
                if (timeframe === "yearly") {
                  return `₹${value / 100000}L`
                }
                return `₹${value / 1000}k`
              }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Received" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Paid" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
