"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"

interface EmptyStateProps {
  title: string
  description: string
  buttonText: string
  onButtonClick: () => void
  showButton?: boolean
}

export function EmptyState({ title, description, buttonText, onButtonClick, showButton = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
      <div className="w-48 h-48 mb-4 relative">
        <Image src="/placeholder-uvtex.png" alt="No data" fill className="object-contain" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {showButton && (
        <Button onClick={onButtonClick}>
          <Plus className="mr-2 h-4 w-4" /> {buttonText}
        </Button>
      )}
    </div>
  )
}
