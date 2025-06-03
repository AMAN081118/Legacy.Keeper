"use client"

import { Trash2, Pencil, RefreshCw, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { resendInvitation } from "@/app/actions/nominees"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useRole } from "@/components/dashboard/role-context"
import { UserCircle } from "lucide-react"
import Image from "next/image"

interface Nominee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  access_categories: string[]
  profile_photo_url: string | null
  government_id_url: string | null
  status: string
  invitation_sent_at: string | null
}

interface NomineeCardProps {
  nominee: Nominee
  onEdit: () => void
  onDelete: () => void
}

export function NomineeCard({ nominee, onEdit, onDelete }: NomineeCardProps) {
  const [isResending, setIsResending] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const { toast } = useToast()
  const { currentRole } = useRole()
  const isUserRole = currentRole?.name === "user" || currentRole?.name === "nominee"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleResendInvitation = async () => {
    if (nominee.status !== "pending" && nominee.status !== "rejected") return

    setIsResending(true)
    try {
      const result = await resendInvitation(nominee.id)
      if (result.success) {
        toast({
          title: "Invitation resent",
          description: "The invitation has been resent successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to resend invitation: ${result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to resend invitation: ${error}`,
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-0 flex flex-col items-center w-full max-w-xs mx-auto">
      {/* Avatar area with icons */}
      <div className="relative w-full flex flex-col items-center pt-6 pb-2 bg-gray-100 rounded-t-xl">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {nominee.profile_photo_url ? (
            <Image
              src={nominee.profile_photo_url}
                alt={nominee.name}
              width={96}
              height={96}
                className="h-full w-full object-cover"
              />
            ) : (
            <UserCircle className="h-16 w-16 text-gray-400" />
            )}
        </div>
        {/* Top right icons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Edit"
          >
            <Pencil className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Name and relationship */}
      <div className="flex flex-col items-center px-6 py-4 w-full">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 text-center w-full truncate">{nominee.name}</h3>
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium rounded-full px-4 py-1 mb-3">{nominee.relationship}</span>
        {/* Email */}
        <div className="flex items-center gap-2 text-gray-700 text-sm w-full mb-1">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="none"/><path d="M22 6l-10 7L2 6" /></svg>
          <span className="truncate">{nominee.email}</span>
        </div>
        {/* Phone */}
        <div className="flex items-center gap-2 text-gray-700 text-sm w-full">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 19 16.91z" /></svg>
          <span className="truncate">{nominee.phone}</span>
        </div>
      </div>
      {/* View icon at bottom right */}
      <div className="flex justify-end w-full px-6 pb-4">
          <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewOpen(true)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="View"
        >
          <Eye className="h-5 w-5" />
          </Button>
      </div>
      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nominee Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{nominee.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{nominee.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Relationship</h3>
              <p className="mt-1">{nominee.relationship}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1">{nominee.phone}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
