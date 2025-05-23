import { useRole } from "@/components/dashboard/role-context"

export function DebtsLoansHeader() {
  const { currentRole } = useRole();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Debts & Loans</h1>
      <p className="text-muted-foreground">Manage your debts and loans to keep track of money given and received.</p>
      {/* Hide Add button for nominees if you add one here in the future */}
    </div>
  )
}
