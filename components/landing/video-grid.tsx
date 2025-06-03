"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { videoData } from "@/lib/landing/video-data"

export function VideoGrid() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  const handleVideoClick = (id: number) => {
    setActiveVideo(id)
    // In a real implementation, this would open a video player modal
    console.log(`Playing video ${id}`)
  }

  return (
    <section className="w-full py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="space-y-16">
          {videoData.map((video) => (
            <div
              key={video.id}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${video.id % 2 === 0 ? "md:flex-row-reverse" : ""}`}
            >
              {/* Video Thumbnail */}
              <div className="relative cursor-pointer group" onClick={() => handleVideoClick(video.id)}>
                <div className="relative h-64 md:h-72 rounded-lg overflow-hidden">
                  <Image
                    src={
                      video.thumbnail ||
                      `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(video.title)}`
                    }
                    alt={video.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Play className="h-8 w-8 text-blue-600 ml-1" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div>
                <h2 className="text-2xl font-bold mb-3">{video.title}</h2>
                <p className="text-gray-600 mb-4">{video.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-blue-700 font-medium">{video.category}</span>
                  <span className="text-sm text-gray-500">{video.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
