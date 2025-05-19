"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsTable } from "./transactions-table"
import type { Tables } from "@/lib/supabase/database.types"

interface TransactionsTabsProps {
  transactionsData: Tables<"transactions">[]
}

export function TransactionsTabs({ transactionsData }: TransactionsTabsProps) {
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
        <TransactionsTable transactions={allTransactions} />
      </TabsContent>
      <TabsContent value="paid">
        <TransactionsTable transactions={paidTransactions} />
      </TabsContent>
      <TabsContent value="received">
        <TransactionsTable transactions={receivedTransactions} />
      </TabsContent>
    </Tabs>
  )
}
