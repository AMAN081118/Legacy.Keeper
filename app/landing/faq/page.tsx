import { FAQContent } from "@/components/faq-content"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "FAQ - Legacy Keeper",
  description: "Frequently Asked Questions about Legacy Keeper's services, pricing, and features.",
}

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <section className="w-full py-12 px-4 bg-blue-50/50">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back to Home</span>
            </Link>

            <div className="flex justify-center mb-6">
              <div className="inline-block rounded-full border border-gray-300 px-6 py-2 bg-white">
                <span className="text-gray-600">FAQ</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-center text-blue-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
              The FAQs section is designed to address any questions or concerns you may have about using the Legacy
              Platform. Whether you're curious about how this platform works, how your data is secured, or what steps to
              take to appoint Trustees and Nominees, we've got you covered.
            </p>
          </div>

          <FAQContent />
        </div>
      </section>
    </main>
  )
}
