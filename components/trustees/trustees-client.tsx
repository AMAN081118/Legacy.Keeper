"use client"

import { useState } from "react"
import { TrusteesHeader } from "./trustees-header"
import { TrusteeCard } from "./trustee-card"
import { EmptyState } from "./empty-state"
import { AddTrusteeModal } from "./add-trustee-modal"
import { EditTrusteeModal } from "./edit-trustee-modal"
import { DeleteTrusteeModal } from "./delete-trustee-modal"
import { useToast } from "@/components/ui/use-toast"

interface Trustee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  profile_photo_url?: string
  government_id_url?: string
  approval_type: string
  status: string
  invitation_token?: string
  invitation_sent_at?: string
  invitation_responded_at?: string
  created_at: string
  updated_at: string
}

interface TrusteesClientProps {
  initialTrustees: Trustee[]
}

export function TrusteesClient({ initialTrustees }: TrusteesClientProps) {
  const [trustees, setTrustees] = useState<Trustee[]>(initialTrustees)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTrustee, setSelectedTrustee] = useState<Trustee | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredTrustees = trustees.filter(
    (trustee) =>
      trustee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trustee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trustee.relationship.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddTrustee = (newTrustee: Trustee) => {
    setTrustees([newTrustee, ...trustees])
    toast({
      title: "Trustee added",
      description: "The trustee has been added successfully.",
    })
  }

  const handleUpdateTrustee = (updatedTrustee: Trustee) => {
    setTrustees(trustees.map((trustee) => (trustee.id === updatedTrustee.id ? updatedTrustee : trustee)))
    toast({
      title: "Trustee updated",
      description: "The trustee has been updated successfully.",
    })
  }

  const handleDeleteTrustee = (id: string) => {
    setTrustees(trustees.filter((trustee) => trustee.id !== id))
    toast({
      title: "Trustee deleted",
      description: "The trustee has been deleted successfully.",
    })
  }

  const openEditModal = (trustee: Trustee) => {
    setSelectedTrustee(trustee)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (trustee: Trustee) => {
    setSelectedTrustee(trustee)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="flex flex-col space-y-6">
      <TrusteesHeader
        onAddTrustee={() => setIsAddModalOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        canAddTrustee={trustees.length === 0}
      />

      {filteredTrustees.length === 0 ? (
        <EmptyState onAddTrustee={() => setIsAddModalOpen(true)} />
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {filteredTrustees.map((trustee) => (
            <TrusteeCard
              key={trustee.id}
              trustee={trustee}
              onEdit={() => openEditModal(trustee)}
              onDelete={() => openDeleteModal(trustee)}
            />
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <AddTrusteeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddTrustee={handleAddTrustee}
        />
      )}

      {isEditModalOpen && selectedTrustee && (
        <EditTrusteeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          trustee={selectedTrustee}
          onUpdateTrustee={handleUpdateTrustee}
        />
      )}

      {isDeleteModalOpen && selectedTrustee && (
        <DeleteTrusteeModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          trusteeId={selectedTrustee.id}
          trusteeName={selectedTrustee.name}
          onDeleteTrustee={handleDeleteTrustee}
        />
      )}
    </div>
  )
}
