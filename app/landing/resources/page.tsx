import { ResourcesHero } from "@/components/landing/resources-hero"
import { ResourceCategories } from "@/components/landing/resource-categories"

export const metadata = {
  title: "Resources - Legacy Keeper",
  description: "Explore our collection of resources including blogs, guides, webinars, and downloads.",
}

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      <ResourcesHero />
      <ResourceCategories />
    </main>
  )
}
