"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerModalProps {
  videoId: number
  videoSrc: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export function VideoPlayerModal({ videoId, videoSrc, title, isOpen, onClose }: VideoPlayerModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="aspect-video w-full">
          {/* In a real implementation, this would be a video player */}
          <div className="w-full h-full bg-black flex items-center justify-center text-white">
            Video player would be here for video ID: {videoId}
          </div>
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
