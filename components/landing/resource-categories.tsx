import Link from "next/link"
import Image from "next/image"

export function ResourceCategories() {
  return (
    <section className="w-full py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blogs */}
          <Link href="/resources/blogs" className="block">
            <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium p-4">Blogs</h3>
              <div className="relative h-48">
                <Image src="/focused-coder.png" alt="Blogs" fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Stay updated with our latest articles on financial planning, legacy management, and family security.
                </p>
              </div>
            </div>
          </Link>

          {/* Help Guides */}
          <Link href="/resources/guides" className="block">
            <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium p-4">Help Guides</h3>
              <div className="relative h-48">
                <Image src="/diverse-handshake-agreement.png" alt="Help Guides" fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Step-by-step instructions to help you make the most of Legacy Keeper's features.
                </p>
              </div>
            </div>
          </Link>

          {/* Video Library */}
          <Link href="/resources/videos" className="block">
            <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium p-4">Video Library</h3>
              <div className="relative h-48">
                <Image src="/simple-video-player.png" alt="Video Library" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-75 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-600 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">LIVE</div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Watch tutorials, webinars, and expert interviews on legacy planning and financial security.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex justify-end mt-6">
          <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">Financial Planning</span>
        </div>
      </div>
    </section>
  )
}
