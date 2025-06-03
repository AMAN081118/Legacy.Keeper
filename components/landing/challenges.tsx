import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"

export function Challenges() {
  return (
    <section className="w-full py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Challenges Header */}
        <div className="border-t border-b border-blue-500 py-8 mb-16">
          <h2 className="text-4xl font-bold text-center mb-4">Challenges</h2>
          <div className="w-full max-w-xl mx-auto border-b border-dashed border-blue-400 mb-4"></div>
          <p className="text-center text-gray-600 max-w-3xl mx-auto">
            Modern families face numerous challenges in managing critical information, finances, and health due to
            changing lifestyles and complex relationships. Here are some common problems that our Legacy Software is
            trying to solve
          </p>
        </div>

        {/* Challenges Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
          {/* Left Side - Vertical "Challenges" */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="relative">
              <Target className="w-20 h-20 text-red-500" />
              <div className="h-[500px] w-0.5 bg-red-500 absolute left-1/2 top-20"></div>
            </div>
            <div className="rotate-90 origin-left translate-y-32 -translate-x-8">
              <h3 className="text-4xl font-bold text-red-500 whitespace-nowrap">Challenges</h3>
            </div>
          </div>

          {/* Right Side - Challenge Items */}
        </div>

        {/* Solution Image */}
        <div className="mt-20 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="rotate-90 origin-left translate-y-32 translate-x-8">
              <h3 className="text-4xl font-bold text-green-600 whitespace-nowrap">Our Solution</h3>
            </div>
            <div className="h-[300px] w-0.5 bg-green-500 mt-4"></div>
            <div className="mt-4">
              <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Legacy_Keeper-A38SS46JlHqeH8KRKhxyCMdud4mIjn.png"
              alt="Legacy Keeper Dashboard"
              width={1000}
              height={600}
              className="w-full h-auto"
            />
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base">Register Now</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-8 py-6 text-base">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
