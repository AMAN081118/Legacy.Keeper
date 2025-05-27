"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsTable } from "./transactions-table"
import type { Tables } from "@/lib/supabase/database.types"
import { useRole } from "@/components/dashboard/role-context"

interface TransactionsTabsProps {
  transactionsData: Tables<"transactions">[]
}

export function TransactionsTabs({ transactionsData }: TransactionsTabsProps) {
  const { currentRole } = useRole();
  const [activeTab, setActiveTab] = useState("all")

  const allTransactions = transactionsData
  const paidTransactions = transactionsData.filter((transaction) => transaction.transaction_type === "Paid")
  const receivedTransactions = transactionsData.filter((transaction) => transaction.transaction_type === "Received")

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">Both Transactions ({allTransactions.length})</TabsTrigger>
        <TabsTrigger value="paid">Paid Transactions ({paidTransactions.length})</TabsTrigger>
        <TabsTrigger value="received">Received Transactions ({receivedTransactions.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <TransactionsTable transactions={allTransactions} currentRole={currentRole} />
      </TabsContent>
      <TabsContent value="paid">
        <TransactionsTable transactions={paidTransactions} currentRole={currentRole} />
      </TabsContent>
      <TabsContent value="received">
        <TransactionsTable transactions={receivedTransactions} currentRole={currentRole} />
      </TabsContent>
    </Tabs>
  )
}

// No changes needed here for route structure. This file only renders tabs and tables, not navigation or routing.
// If you want to update navigation, do it in the sidebar or navigation components.
