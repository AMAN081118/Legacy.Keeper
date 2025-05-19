"use client"

import { Trash2, Pencil, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { resendInvitation } from "@/app/actions/nominees"

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
  const { toast } = useToast()

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
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
            {nominee.profile_photo_url ? (
              <img
                src={nominee.profile_photo_url || "/placeholder.svg"}
                alt={nominee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                {nominee.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium">{nominee.name}</h3>
            <p className="text-sm text-gray-500">{nominee.relationship}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4 text-gray-500" />
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
          <span className="text-sm">{nominee.email}</span>
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
          <span className="text-sm">{nominee.phone}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Badge className={`${getStatusColor(nominee.status)}`}>
          {nominee.status.charAt(0).toUpperCase() + nominee.status.slice(1)}
        </Badge>
        {(nominee.status === "pending" || nominee.status === "rejected") && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleResendInvitation}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Invitation"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
