"use client"

import { Button } from "@/components/ui/button"
import { UserPlus, Download } from "lucide-react"

interface NomineesHeaderProps {
  nomineeCount: number
  onAddNominee: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function NomineesHeader({ nomineeCount, onAddNominee, searchQuery, onSearchChange }: NomineesHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nominees ({nomineeCount.toString().padStart(2, "0")})</h1>
          <p className="text-gray-500">Manage your nominees</p>
        </div>
        <Button onClick={onAddNominee}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Nominee
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
}
