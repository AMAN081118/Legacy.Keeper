"use client"

import { useState } from "react"
import { NomineesHeader } from "./nominees-header"
import { NomineeCard } from "./nominee-card"
import { EmptyState } from "./empty-state"
import { AddNomineeModal } from "./add-nominee-modal"
import { EditNomineeModal } from "./edit-nominee-modal"
import { DeleteNomineeModal } from "./delete-nominee-modal"
import { useToast } from "@/components/ui/use-toast"
import { getNominees, deleteNominee } from "@/app/actions/nominees"

interface Nominee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  access_categories: string[]
  profile_photo_url: string | null
  government_id_url: string | null
}

interface NomineesClientProps {
  initialNominees: Nominee[]
}

export function NomineesClient({ initialNominees }: NomineesClientProps) {
  const [nominees, setNominees] = useState<Nominee[]>(initialNominees)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const filteredNominees = nominees.filter(
    (nominee) =>
      nominee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nominee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nominee.relationship?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddNominee = async () => {
    setIsAddModalOpen(false)
    await refreshNominees()
  }

  const handleEditNominee = async () => {
    setIsEditModalOpen(false)
    setSelectedNominee(null)
    await refreshNominees()
  }

  const handleDeleteNominee = async () => {
    if (!selectedNominee) return

    setIsLoading(true)
    try {
      const result = await deleteNominee(selectedNominee.id)
      if (result.success) {
        toast({
          title: "Nominee deleted",
          description: "The nominee has been deleted successfully.",
        })
        await refreshNominees()
      } else {
        toast({
          title: "Error",
          description: `Failed to delete nominee: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete nominee: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteModalOpen(false)
      setSelectedNominee(null)
    }
  }

  const refreshNominees = async () => {
    try {
      const refreshedNominees = await getNominees()
      setNominees(refreshedNominees)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh nominees.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <NomineesHeader
        nomineeCount={nominees.length}
        onAddNominee={() => setIsAddModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {nominees.length === 0 ? (
        <EmptyState onAddNominee={() => setIsAddModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNominees.map((nominee) => (
            <NomineeCard
              key={nominee.id}
              nominee={nominee}
              onEdit={() => {
                setSelectedNominee(nominee)
                setIsEditModalOpen(true)
              }}
              onDelete={() => {
                setSelectedNominee(nominee)
                setIsDeleteModalOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <AddNomineeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleAddNominee} />

      {selectedNominee && (
        <>
          <EditNomineeModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setSelectedNominee(null)
            }}
            nominee={selectedNominee}
            onSuccess={handleEditNominee}
          />

          <DeleteNomineeModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setSelectedNominee(null)
            }}
            onDelete={handleDeleteNominee}
            isLoading={isLoading}
            nomineeName={selectedNominee.name}
          />
        </>
      )}
    </>
  )
}
