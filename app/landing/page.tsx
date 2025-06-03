import { HeroSection } from "@/components/landing/hero-section"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <Features />
      <Pricing />
      <FAQ />
    </main>
  )
}
