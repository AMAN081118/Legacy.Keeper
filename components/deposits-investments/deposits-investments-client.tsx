"use client";

import { useEffect, useState } from "react";
import { DepositsInvestmentsHeader } from "./deposits-investments-header";
import { DepositsInvestmentsTabs } from "./deposits-investments-tabs";
import { DepositsInvestmentsTable } from "./deposits-investments-table";
import { getDepositsInvestments, getDepositsInvestmentsStats } from "@/app/actions/deposits-investments";
import type { DepositInvestment } from "@/lib/supabase/database.types";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

interface DepositsInvestmentsClientProps {
  initialDeposits: DepositInvestment[];
  initialStats: { totalAmount: number; count: number };
  userId: string;
}

export default function DepositsInvestmentsClient({ initialDeposits, initialStats, userId }: DepositsInvestmentsClientProps) {
  const [depositsInvestments, setDepositsInvestments] = useState<DepositInvestment[]>(initialDeposits);
  const [filteredDepositsInvestments, setFilteredDepositsInvestments] = useState<DepositInvestment[]>(initialDeposits);
  const [stats, setStats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let filtered = [...depositsInvestments];

    // Filter by tab
    if (activeTab !== "All") {
      filtered = filtered.filter((item) => {
        if (activeTab === "Bank") return item.investment_type === "Bank";
        if (activeTab === "Gold/Silver") return ["Gold", "Silver"].includes(item.investment_type);
        if (activeTab === "Shares/Bond") return ["Shares", "Bond"].includes(item.investment_type);
        if (activeTab === "Property") return item.investment_type === "Property";
        if (activeTab === "Digital Asset") return item.investment_type === "DigitalAsset";
        if (activeTab === "Others") return item.investment_type === "Other";
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.paid_to?.toLowerCase().includes(query)
      );
    }

    setFilteredDepositsInvestments(filtered);
  }, [depositsInvestments, activeTab, searchQuery]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Only fetch on refresh, not on mount
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [depositsResponse, statsResponse] = await Promise.all([
        getDepositsInvestments(userId),
        getDepositsInvestmentsStats(),
      ]);

      if (depositsResponse.success && depositsResponse.data) {
        setDepositsInvestments(depositsResponse.data);
      } else {
        toast.toast({
          title: "Error",
          description: depositsResponse.error || "Failed to refresh data",
          variant: "destructive",
        });
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DepositsInvestmentsHeader 
        totalAmount={stats.totalAmount} 
        count={stats.count} 
        onRefresh={handleRefresh}
        depositsInvestments={depositsInvestments}
      />
      <DepositsInvestmentsTabs activeTab={activeTab} onTabChange={handleTabChange} />
      <DepositsInvestmentsTable
        depositsInvestments={filteredDepositsInvestments}
        loading={loading}
        onRefresh={handleRefresh}
      />
      <Toaster />
    </div>
  );
} 