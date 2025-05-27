"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Edit, Eye, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Trustee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  profile_photo_url?: string
  government_id_url?: string
  approval_type: string
  created_at: string
  updated_at: string
  status: string
}

interface TrusteeCardProps {
  trustee: Trustee
  onEdit: () => void
  onDelete: () => void
}

export function TrusteeCard({ trustee, onEdit, onDelete }: TrusteeCardProps) {
  const [viewOpen, setViewOpen] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleResendInvitation = async () => {
    if (trustee.status !== "pending" && trustee.status !== "rejected") return
    setIsResending(true)
    try {
      // TODO: Implement resend invitation logic for trustees
      // await resendTrusteeInvitation(trustee.id)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
            {trustee.profile_photo_url ? (
              <Image
                src={trustee.profile_photo_url}
                alt={trustee.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                {trustee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium">{trustee.name}</h3>
            <p className="text-sm text-gray-500">{trustee.relationship}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" aria-label="View" onClick={() => setViewOpen(true)}>
            <Eye className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">{trustee.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="text-sm">{trustee.phone}</span>
        </div>
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className="text-sm font-medium">{trustee.status}</span>
          </div>
          {trustee.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendInvitation}
              disabled={isResending}
              className="text-xs"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Resend Invitation
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="bg-blue-100 text-blue-800 border border-blue-200 rounded px-2 py-1 text-xs font-medium">
          {trustee.approval_type}
        </span>
      </div>
      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trustee Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {trustee.profile_photo_url ? (
              <Image
                src={trustee.profile_photo_url}
                alt={trustee.name}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <span className="text-2xl font-bold">{trustee.name.charAt(0)}</span>
              </div>
            )}
            <div className="w-full space-y-2">
              <div>
                <span className="font-medium">Name: </span>{trustee.name}
              </div>
              <div>
                <span className="font-medium">Email: </span>{trustee.email}
              </div>
              <div>
                <span className="font-medium">Relationship: </span>{trustee.relationship}
              </div>
              <div>
                <span className="font-medium">Phone: </span>{trustee.phone}
              </div>
              <div>
                <span className="font-medium">Approval Type: </span>{trustee.approval_type}
              </div>
              {trustee.government_id_url && (
                <div>
                  <span className="font-medium">Government ID: </span>
                  <a href={trustee.government_id_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
