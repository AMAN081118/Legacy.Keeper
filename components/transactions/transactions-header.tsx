import type { User } from "@/lib/supabase/database.types"

interface TransactionsHeaderProps {
  userData: User | null
}

export function TransactionsHeader({ userData }: TransactionsHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
      <p className="text-muted-foreground">View transaction details here!</p>
    </div>
  )
}
