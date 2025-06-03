"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DebtsLoansTable } from "./debts-loans-table"
import { AddDebtLoanModal } from "./add-debt-loan-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { DebtLoan } from "@/lib/supabase/database.types"

interface DebtsLoansTabsProps {
  moneyGiven: DebtLoan[]
  moneyReceived: DebtLoan[]
}

export function DebtsLoansTabs({ moneyGiven, moneyReceived }: DebtsLoansTabsProps) {
  const [activeTab, setActiveTab] = useState("given")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Handler to refresh data after add/edit
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Tabs defaultValue="given" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <TabsList>
              <TabsTrigger value="given">Money Given ({moneyGiven.length})</TabsTrigger>
              <TabsTrigger value="received">Money Received ({moneyReceived.length})</TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Entry
            </Button>
          </div>
          <TabsContent value="given" className="mt-6">
            <DebtsLoansTable data={moneyGiven} type="given" />
          </TabsContent>
          <TabsContent value="received" className="mt-6">
            <DebtsLoansTable data={moneyReceived} type="received" />
          </TabsContent>
        </Tabs>
      </div>

      <AddDebtLoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultType={activeTab === "given" ? "Given" : "Received"}
        onSuccess={handleRefresh}
      />
    </>
  )
}
