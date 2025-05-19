"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Edit } from "lucide-react"
import Image from "next/image"

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
}

interface TrusteeCardProps {
  trustee: Trustee
  onEdit: () => void
  onDelete: () => void
}

export function TrusteeCard({ trustee, onEdit, onDelete }: TrusteeCardProps) {
  return (
    <div className="relative rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
            {trustee.profile_photo_url ? (
              <Image
                src={trustee.profile_photo_url || "/placeholder.svg"}
                alt={trustee.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                {trustee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{trustee.name}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
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
                {trustee.email}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
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
                {trustee.phone}
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}
