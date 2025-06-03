"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AddMemberModal } from "./add-member-modal"
import { exportToCSV } from "@/utils/csv-export"

interface FamilyMember {
  id: string
  member_name: string
  contact_number: string | null
}

interface FamilyVaultsClientProps {
  initialMembers: FamilyMember[]
}

export function FamilyVaultsClient({ initialMembers }: FamilyVaultsClientProps) {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Filter members based on search query
  const filteredMembers = members.filter(
    (member) =>
      member.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.contact_number && member.contact_number.includes(searchQuery)),
  )

  // Download handler
  const handleExportCSV = () => {
    const csvData = members.map((member) => ({
      "Name": member.member_name,
      "Contact Number": member.contact_number || "",
    }))
    exportToCSV(csvData, "family_vault_members")
  }

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold mb-2 sm:mb-0">Family Vault ({members.length})</h2>
          <div className="flex flex-col items-end gap-2">
            <Button className="w-48 mb-2" onClick={() => setIsAddModalOpen(true)}>
                Add New Member
            </Button>
            <Button variant="outline" className="w-32 flex items-center gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="w-full max-w-md">
          <Input
            type="search"
            placeholder="Search"
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {filteredMembers.map((member) => (
              <Link key={member.id} href={`/dashboard/family-vaults/${member.id}`} className="block">
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                    <Image
                      src="/person-silhouette.png"
                      alt={member.member_name}
                      width={96}
                      height={96}
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className="font-medium text-center">{member.member_name}</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {member.contact_number || "No contact number"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium">
                {searchQuery ? "No matching family members found" : "No family members found"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search query" : "Get started by adding a new family member"}
              </p>
            </div>
          </div>
        )}
      </div>

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  )
}
