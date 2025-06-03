import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="w-full py-12 md:py-16 bg-blue-50/50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Give your <span className="text-green-500 bg-green-100/70 px-2 py-1 rounded">family</span> the financial
              insights they need,with the{" "}
              <span className="text-purple-600 bg-purple-100/70 px-2 py-1 rounded">security</span> and{" "}
              <span className="text-yellow-600 bg-yellow-100/70 px-2 py-1 rounded">privacy</span> measures you demand
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-md px-6 py-3 text-sm">
                Get Free Trial Now
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 rounded-md px-6 py-3 text-sm">
                Get info on whatsapp
              </Button>
            </div>
          </div>
          <div className="relative grid grid-cols-1 gap-4">
            <div className="relative">
              <div className="absolute -left-8 top-4 bg-pink-500 text-white px-4 py-1 rounded-full text-sm">
                Finance
              </div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KyzkMCDxz4fiVuzHUwkIUoD5RyngQq.png"
                width={800}
                height={600}
                alt="Legacy Keeper Hero"
                className="rounded-lg object-cover w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
