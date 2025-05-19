import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Tables } from "@/lib/supabase/database.types"

interface RequestsHeaderProps {
  userData: Tables<"users"> | null
}

export function RequestsHeader({ userData }: RequestsHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>Requests</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Welcome {userData?.name || "User"}!</h1>
      <p className="text-sm text-gray-500">Check Your Requests</p>
    </div>
  )
}
