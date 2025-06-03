import { FeatureDetails } from "@/components/landing/feature-details"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "Features - Legacy Keeper",
  description: "Explore the features of Legacy Keeper that help simplify family life with smart solutions.",
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <FeatureDetails />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link href="/landing" className="flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Home</span>
        </Link>
      </div>
    </main>
  )
}
