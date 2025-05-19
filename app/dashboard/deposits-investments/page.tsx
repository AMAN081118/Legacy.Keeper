"use client"

import { useEffect, useState } from "react"
import { DepositsInvestmentsHeader } from "@/components/deposits-investments/deposits-investments-header"
import { DepositsInvestmentsTabs } from "@/components/deposits-investments/deposits-investments-tabs"
import { DepositsInvestmentsTable } from "@/components/deposits-investments/deposits-investments-table"
import { DepositsInvestmentsFilter } from "@/components/deposits-investments/deposits-investments-filter"
import { getDepositsInvestments, getDepositsInvestmentsStats } from "@/app/actions/deposits-investments"
import type { DepositInvestment } from "@/lib/supabase/database.types"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

export default function DepositsInvestmentsPage() {
  const [depositsInvestments, setDepositsInvestments] = useState<DepositInvestment[]>([])
  const [filteredDepositsInvestments, setFilteredDepositsInvestments] = useState<DepositInvestment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAmount: 0, count: 0 })
  const [activeTab, setActiveTab] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [depositsResponse, statsResponse] = await Promise.all([
          getDepositsInvestments(),
          getDepositsInvestmentsStats(),
        ])

        if (depositsResponse.success && depositsResponse.data) {
          setDepositsInvestments(depositsResponse.data)
          setFilteredDepositsInvestments(depositsResponse.data)
        } else {
          toast({
            title: "Error",
            description: depositsResponse.error || "Failed to fetch deposits and investments",
            variant: "destructive",
          })
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    let filtered = [...depositsInvestments]

    // Filter by tab
    if (activeTab !== "All") {
      filtered = filtered.filter((item) => {
        if (activeTab === "Bank") return item.investment_type === "Bank"
        if (activeTab === "Gold/Silver") return ["Gold", "Silver"].includes(item.investment_type)
        if (activeTab === "Shares/Bond") return ["Shares", "Bond"].includes(item.investment_type)
        if (activeTab === "Property") return item.investment_type === "Property"
        if (activeTab === "Digital Asset") return item.investment_type === "DigitalAsset"
        if (activeTab === "Others") return item.investment_type === "Other"
        return true
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.paid_to?.toLowerCase().includes(query),
      )
    }

    setFilteredDepositsInvestments(filtered)
  }, [depositsInvestments, activeTab, searchQuery])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const [depositsResponse, statsResponse] = await Promise.all([
        getDepositsInvestments(),
        getDepositsInvestmentsStats(),
      ])

      if (depositsResponse.success && depositsResponse.data) {
        setDepositsInvestments(depositsResponse.data)
      } else {
        toast({
          title: "Error",
          description: depositsResponse.error || "Failed to refresh data",
          variant: "destructive",
        })
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <DepositsInvestmentsHeader totalAmount={stats.totalAmount} count={stats.count} onRefresh={handleRefresh} />

      <DepositsInvestmentsTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <DepositsInvestmentsFilter onSearch={handleSearch} />

      <DepositsInvestmentsTable
        depositsInvestments={filteredDepositsInvestments}
        loading={loading}
        onRefresh={handleRefresh}
      />

      <Toaster />
    </div>
  )
}
