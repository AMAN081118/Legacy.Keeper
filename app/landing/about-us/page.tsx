import { AboutHero } from "@/components/about-hero"
import { AboutServices } from "@/components/about-services"
import { AboutValues } from "@/components/about-values"

export const metadata = {
  title: "About Us - Legacy Keeper",
  description:
    "Learn about Legacy Keeper's mission to empower families for a stronger, more connected, and secure future.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHero />
      <AboutServices />
      <AboutValues />
    </main>
  )
}
