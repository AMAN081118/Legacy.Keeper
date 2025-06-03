import { GuidesHeader } from "@/components/guides-header"
import { GuidesGrid } from "@/components/guides-grid"

export const metadata = {
  title: "Help Guides - Legacy Keeper",
  description: "Explore our comprehensive guides on financial planning, legacy management, and family security.",
}

export default function GuidesPage() {
  return (
    <main className="min-h-screen">
      <GuidesHeader />
      <GuidesGrid />
    </main>
  )
}
