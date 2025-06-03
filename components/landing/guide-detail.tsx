import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { GuideItem } from "@/lib/guides-data"

interface GuideDetailProps {
  guide: GuideItem
}

export function GuideDetail({ guide }: GuideDetailProps) {
  return (
    <article className="w-full py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back to Guides Button */}
        <Link href="/resources/guides" className="flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Guides</span>
        </Link>

        {/* Guide Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {guide.category}
            </Badge>
            <span className="text-sm text-gray-500">{guide.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{guide.title}</h1>
        </div>

        {/* Featured Image */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image src={guide.thumbnail || "/placeholder.svg"} alt={guide.title} fill className="object-cover" />
        </div>

        {/* Guide Content - Placeholder */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-6">{guide.description}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
          <p className="text-gray-700 mb-6">
            This is a placeholder for the full guide content. In a real implementation, this would contain the complete
            guide with detailed information, examples, and actionable advice.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Key Points</h2>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Important point 1 about {guide.title}</li>
            <li className="mb-2">Important point 2 about {guide.title}</li>
            <li className="mb-2">Important point 3 about {guide.title}</li>
            <li className="mb-2">Important point 4 about {guide.title}</li>
            <li className="mb-2">Important point 5 about {guide.title}</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
          <p className="text-gray-700 mb-6">
            This guide has provided an overview of {guide.title}. We hope you found this information helpful and can
            apply these insights to your own situation.
          </p>
        </div>

        {/* Author Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center">
            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
              <Image src="/placeholder.svg?key=author" alt="Author" fill className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold">Written by Financial Expert</h3>
              <p className="text-sm text-gray-600">Financial Planning Specialist at Legacy Keeper</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
