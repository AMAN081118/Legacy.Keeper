"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import type { DigitalAccount } from "@/lib/supabase/database.types"
import { formatDate } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { EditAccountModal } from "./edit-account-modal"
import { DeleteAccountModal } from "./delete-account-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

  // State for modals
  const [viewAccount, setViewAccount] = useState<DigitalAccount | null>(null)
  const [editAccount, setEditAccount] = useState<DigitalAccount | null>(null)
  const [deleteAccount, setDeleteAccount] = useState<DigitalAccount | null>(null)

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
                  <TableCell>{account.password_phone ? account.password_phone : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" aria-label="View" onClick={() => setViewAccount(account)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {currentRole?.name !== "nominee" && (
                        <>
                          <Button variant="outline" size="icon" aria-label="Edit" onClick={() => setEditAccount(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" aria-label="Delete" onClick={() => setDeleteAccount(account)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* View Modal */}
      <Dialog open={!!viewAccount} onOpenChange={(open) => !open && setViewAccount(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {viewAccount && (
            <div className="space-y-2">
              <div><b>Date:</b> {formatDate(viewAccount.date)}</div>
              <div><b>Account Name:</b> {viewAccount.account_name}</div>
              <div><b>Account Id/No:</b> {viewAccount.account_id_no || "-"}</div>
              <div><b>Password / Phone number:</b> {viewAccount.password_phone || "-"}</div>
              <div><b>Login/Contact:</b> {viewAccount.login_contact || "-"}</div>
              <div><b>Description:</b> {viewAccount.description || "-"}</div>
              {viewAccount.government_id_url && (
                <div><b>Government ID:</b> <a href={viewAccount.government_id_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View File</a></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editAccount && (
        <EditAccountModal
          isOpen={!!editAccount}
          onClose={() => setEditAccount(null)}
          onSuccess={() => setEditAccount(null)}
          account={editAccount}
          userId={editAccount.user_id}
        />
      )}

      {/* Delete Modal */}
      {deleteAccount && (
        <DeleteAccountModal
          isOpen={!!deleteAccount}
          onClose={() => setDeleteAccount(null)}
          onSuccess={() => setDeleteAccount(null)}
          account={deleteAccount}
        />
      )}
    </div>
  )
}
