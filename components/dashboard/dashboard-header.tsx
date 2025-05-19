import type { Tables } from "@/lib/supabase/database.types"

interface DashboardHeaderProps {
  userData: Tables<"users"> | null
}

export function DashboardHeader({ userData }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome {userData?.name || "User"}!</h1>
      <p className="text-sm text-gray-500">Check Your Dashboard</p>
    </div>
  )
}
