import { Footer } from "@/components/footer"
import { Newsletter } from "@/components/newsletter"
import { GuideDetail } from "@/components/guide-detail"
import { guidesData } from "@/lib/guides-data"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = guidesData.find((guide) => guide.slug === params.slug)

  if (!guide) {
    return {
      title: "Guide Not Found - Legacy Keeper",
      description: "The requested guide could not be found.",
    }
  }

  return {
    title: `${guide.title} - Legacy Keeper Guides`,
    description: guide.description,
  }
}

export default function GuideDetailPage({ params }: { params: { slug: string } }) {
  const guide = guidesData.find((guide) => guide.slug === params.slug)

  if (!guide) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <GuideDetail guide={guide} />
      <Newsletter />
      <Footer />
    </main>
  )
}
