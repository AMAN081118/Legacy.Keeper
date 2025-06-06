import { Footer } from "@/components/landing/footer"
import { Newsletter } from "@/components/landing/newsletter"
import { GuideDetail } from "@/components/landing/guide-detail"
import { guidesData } from "@/lib/landing/guides-data"
import { notFound } from "next/navigation"
import { Metadata } from "next"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const guide = guidesData.find((g) => g.slug === resolvedParams.slug)
  if (!guide) return {}

  return {
    title: guide.title,
    description: guide.description,
  }
}

export default async function GuidePage({ params }: PageProps) {
  const resolvedParams = await params
  const guide = guidesData.find((g) => g.slug === resolvedParams.slug)
  if (!guide) notFound()

  return (
    <>
      <GuideDetail guide={guide} />
      <Newsletter />
      <Footer />
    </>
  )
}
