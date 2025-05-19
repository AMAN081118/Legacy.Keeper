"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

import { DigitalAccountsHeader } from "./digital-accounts-header"
import { DigitalAccountsTable } from "./digital-accounts-table"
import { EmptyState } from "./empty-state"
import { AddAccountModal } from "./add-account-modal"
import { EditAccountModal } from "./edit-account-modal"
import { DeleteAccountModal } from "./delete-account-modal"
import { getDigitalAccounts } from "@/app/actions/digital-accounts"
import type { DigitalAccount } from "@/lib/supabase/database.types"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DigitalAccountsClientProps {
  userId: string
}

export function DigitalAccountsClient({ userId }: DigitalAccountsClientProps) {
  const [accounts, setAccounts] = useState<DigitalAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<DigitalAccount | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const fetchAccounts = useCallback(
    async (showLoadingState = true) => {
      if (showLoadingState) {
        setLoading(true)
      }
      setError(null)

      try {
        const result = await getDigitalAccounts(userId)

        if (result.success) {
          setAccounts(result.data || [])
        } else {
          setError(result.error || "Failed to fetch accounts")
          toast({
            title: "Error",
            description: result.error || "Failed to fetch accounts",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        const errorMessage = error.message || "An unexpected error occurred"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [userId, toast],
  )

  useEffect(() => {
    fetchAccounts()

    // Check if modal should be open based on URL params
    const modalParam = searchParams.get("modal")
    if (modalParam === "add") {
      setIsAddModalOpen(true)
    }
  }, [searchParams, fetchAccounts])

  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    fetchAccounts()
    toast({
      title: "Success",
      description: "Account added successfully",
    })
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setSelectedAccount(null)
    fetchAccounts()
    toast({
      title: "Success",
      description: "Account updated successfully",
    })
  }

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false)
    setSelectedAccount(null)
    fetchAccounts()
    toast({
      title: "Success",
      description: "Account deleted successfully",
    })
  }

  const handleEdit = (account: DigitalAccount) => {
    setSelectedAccount(account)
    setIsEditModalOpen(true)
  }

  const handleDelete = (account: DigitalAccount) => {
    setSelectedAccount(account)
    setIsDeleteModalOpen(true)
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchAccounts()
  }

  const filteredAccounts = accounts.filter(
    (account) =>
      account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.account_id_no && account.account_id_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (account.description && account.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <>
      <DigitalAccountsHeader
        onAddNew={() => setIsAddModalOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      ) : accounts.length === 0 && !error ? (
        <EmptyState onAddNew={() => setIsAddModalOpen(true)} />
      ) : (
        !error && <DigitalAccountsTable accounts={filteredAccounts} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        userId={userId}
      />

      {selectedAccount && (
        <>
          <EditAccountModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedAccount(null)
            }}
            onSuccess={handleEditSuccess}
            account={selectedAccount}
            userId={userId}
          />

          <DeleteAccountModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedAccount(null)
            }}
            onSuccess={handleDeleteSuccess}
            account={selectedAccount}
          />
        </>
      )}
    </>
  )
}
