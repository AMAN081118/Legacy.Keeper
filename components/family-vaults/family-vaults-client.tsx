"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AddMemberModal } from "./add-member-modal"

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

  return (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Family Vault ({members.length})</h2>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="h-4 w-4" />+ Add New Member
            </Button>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <Link key={member.id} href={`/dashboard/family-vaults/${member.id}`} className="block">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
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
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium">
                {searchQuery ? "No matching family members found" : "No family members found"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search query" : "Get started by adding a new family member"}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Add New Member
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  )
}
