import { Newsletter } from "@/components/landing/newsletter"
import { Footer } from "@/components/landing/footer"
import { VideoLibraryHeader } from "@/components/landing/video-library-header"
import { VideoGrid } from "@/components/landing/video-grid"

export const metadata = {
  title: "Video Library - Legacy Keeper",
  description:
    "Explore, learn, and grow with our collection of educational videos on financial planning and management.",
}

export default function VideoLibraryPage() {
  return (
    <main className="min-h-screen">
      <VideoLibraryHeader />
      <VideoGrid />
      <Newsletter />
      <Footer />
    </main>
  )
}
