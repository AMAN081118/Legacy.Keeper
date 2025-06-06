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
  const { currentRole } = useRole()
  const [activeTab, setActiveTab] = useState("all")

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Transactions</TabsTrigger>
        <TabsTrigger value="paid">Paid</TabsTrigger>
        <TabsTrigger value="received">Received</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <TransactionsTable 
          transactions={transactionsData} 
          currentRole={currentRole?.name || "user"} 
        />
      </TabsContent>
      <TabsContent value="paid">
        <TransactionsTable 
          transactions={transactionsData.filter(t => t.transaction_type === "Paid")} 
          currentRole={currentRole?.name || "user"} 
        />
      </TabsContent>
      <TabsContent value="received">
        <TransactionsTable 
          transactions={transactionsData.filter(t => t.transaction_type === "Received")} 
          currentRole={currentRole?.name || "user"} 
        />
      </TabsContent>
    </Tabs>
  )
}

// No changes needed here for route structure. This file only renders tabs and tables, not navigation or routing.
// If you want to update navigation, do it in the sidebar or navigation components.
