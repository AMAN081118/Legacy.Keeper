import Image from "next/image"
import Link from "next/link"
import { guidesData } from "@/lib/landing/guides-data"
import { Badge } from "@/components/ui/badge"

export function GuidesGrid() {
  return (
    <section className="w-full py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guidesData.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <Image src={guide.thumbnail || "/placeholder.svg"} alt={guide.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {guide.category}
                  </Badge>
                  <span className="text-sm text-gray-500">{guide.readTime}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 line-clamp-2">{guide.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{guide.description}</p>
                <Link
                  href={`/resources/guides/${guide.slug}`}
                  className="text-blue-700 font-medium hover:underline inline-flex items-center"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
