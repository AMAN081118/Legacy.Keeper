"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import type { DigitalAccount } from "@/lib/supabase/database.types"
import { formatDate } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { EditAccountModal } from "./edit-account-modal"
import { DeleteAccountModal } from "./delete-account-modal"

interface DigitalAccountsTableProps {
  accounts: DigitalAccount[]
  onEdit: (account: DigitalAccount) => void
  onDelete: (account: DigitalAccount) => void
  currentRole: { name: string } | null
}

export function DigitalAccountsTable({ accounts, onEdit, onDelete, currentRole }: DigitalAccountsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(accounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAccounts = accounts.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Account Id/No</TableHead>
              <TableHead>Password / Phone number</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No accounts found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{formatDate(account.date)}</TableCell>
                  <TableCell>{account.account_name}</TableCell>
                  <TableCell>{account.account_id_no || "-"}</TableCell>
                  <TableCell>{account.password_phone ? "••••••••" : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Only show edit/delete if not nominee */}
                      <Button variant="outline" size="icon" aria-label="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {currentRole?.name !== "nominee" && (
                        <>
                          <EditAccountModal account={account} />
                          <DeleteAccountModal account={account} />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {accounts.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  )
}
