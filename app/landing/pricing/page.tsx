import { PricingPlans } from "@/components/landing/pricing-plans"
import { PaymentFeatures } from "@/components/landing/payment-features"
import { PricingFAQ } from "@/components/landing/pricing-faq"

export const metadata = {
  title: "Pricing - Legacy Keeper",
  description: "Choose a plan that's right for you and your family. Secure your legacy today.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <PricingPlans />
      <PaymentFeatures />
      <PricingFAQ />
    </main>
  )
}
