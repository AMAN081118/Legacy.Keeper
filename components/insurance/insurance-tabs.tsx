"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShieldIcon, HeartPulseIcon, ClockIcon, CarIcon, HomeIcon, PackageIcon, MoreHorizontalIcon } from "lucide-react"

const insuranceTypes = [
  { id: "All", label: "All", icon: ShieldIcon },
  { id: "Life", label: "Life Insurance", icon: HeartPulseIcon },
  { id: "Health", label: "Health Insurance", icon: HeartPulseIcon },
  { id: "Term", label: "Term Insurance", icon: ClockIcon },
  { id: "Auto", label: "Auto Insurance", icon: CarIcon },
  { id: "Property", label: "Property", icon: HomeIcon },
  { id: "Content", label: "Content", icon: PackageIcon },
  { id: "Other", label: "Others", icon: MoreHorizontalIcon },
]

export function InsuranceTabs({ activeTab = "All" }: { activeTab?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", type)
    params.delete("page") // Reset to page 1 when changing tabs
    return params.toString()
  }

  return (
    <div className="border-b">
      <h3 className="mb-2 text-lg font-medium">Insurance Methods</h3>
      <div className="flex overflow-x-auto pb-2 gap-2">
        {insuranceTypes.map((type) => {
          const Icon = type.icon
          const isActive = activeTab === type.id

          return (
            <Link
              key={type.id}
              href={`${pathname}?${createQueryString(type.id)}`}
              className={cn(
                "flex flex-col items-center justify-center p-4 min-w-[100px] border rounded-md transition-colors",
                isActive ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50",
              )}
            >
              <Icon className={cn("h-6 w-6 mb-2", isActive ? "text-blue-600" : "text-gray-500")} />
              <span className={cn("text-sm font-medium text-center", isActive ? "text-blue-600" : "text-gray-700")}>
                {type.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
