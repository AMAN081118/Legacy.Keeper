import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DollarSign, FilePlus, ArrowRight } from "lucide-react"

export function Features() {
  return (
    <section className="w-full py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Features Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
            <span className="text-gray-600">Features</span>
          </div>
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">Keep Everything In One Place</h2>
          <p className="text-center text-gray-600 max-w-3xl">
            Store and manage all your critical information in one secure platform. Legacy Keeper helps you organize
            financial data, health records, and important documents for your family's peace of mind.
          </p>
        </div>

        {/* Features Grid - Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Transactions */}
          <div className="bg-green-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6">
              <DollarSign className="w-full h-full text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Transactions:</h3>
            <p className="text-gray-700">
              Monitor and manage all your <span className="text-green-600 font-medium">financial transactions</span>{" "}
              with ease, receiving status updates in one centralized location.
            </p>
          </div>

          {/* Health Records */}
          <div className="bg-purple-50 rounded-lg p-8">
            <div className="w-12 h-12 mb-6 flex justify-end">
              <FilePlus className="w-full h-full text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-right">Health Records</h3>
            <p className="text-gray-700 text-right">
              Organize <span className="text-purple-600 font-medium">health records</span> for you and your family,
              facilitating better coordination during difficult times.
            </p>
          </div>
        </div>

        {/* View All Features Button */}
        <div className="flex justify-center">
          <Link href="/features">
            <Button variant="outline" className="border-blue-300 text-blue-700 flex items-center gap-2">
              View All Features
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
