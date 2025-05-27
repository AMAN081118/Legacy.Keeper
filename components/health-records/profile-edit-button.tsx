"use client"

import { useState } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const EditMemberModal = dynamic(() => import("./edit-member-modal").then(mod => mod.EditMemberModal), { ssr: false })

interface ProfileEditButtonProps {
  record: any
}

export function ProfileEditButton({ record }: ProfileEditButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4" />
        Edit
      </Button>
      <EditMemberModal record={record} open={open} onClose={() => setOpen(false)} />
    </>
  )
} 