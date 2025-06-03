import { ResourcesHero } from "@/components/resources-hero"
import { ResourceCategories } from "@/components/resource-categories"

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
