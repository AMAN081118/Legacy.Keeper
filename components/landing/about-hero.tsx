import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Target, Eye } from "lucide-react"

export function AboutHero() {
  return (
    <section className="w-full py-16 px-4 bg-blue-50/50">
      <div className="container mx-auto max-w-5xl">
        {/* About Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6 bg-white">
            <span className="text-gray-600">About Us</span>
          </div>
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-4">
            Empowering Families for a Stronger, More Connected, and Secure Future
          </h1>
          <p className="text-center text-gray-600 max-w-3xl">
            We are on a mission to help families improve communication, planning, and organization. Through education
            and technology, we ensure that families stay prepared, reduce conflicts, and build a future where everyone
            feels safe and connected. Join us in making a lasting impact!
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Mission */}
          <div className="bg-white border border-green-100 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-green-700">Our Mission</h2>
            </div>
            <p className="text-gray-700">
              Our mission is to empower families with the tools and knowledge they need to plan better, communicate
              openly, and manage critical life information securely. By doing so, we aim to reduce family disputes,
              ensure smoother transitions during emergencies, and foster stronger connections among loved ones.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white border border-yellow-100 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Eye className="h-8 w-8 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-700">Our Vision</h2>
            </div>
            <p className="text-gray-700">
              We envision a world where every family is prepared for life's uncertainties—where communication is
              seamless, disputes are minimized, and critical information is always accessible when needed. Our ultimate
              goal is to create a society where technology bridges gaps in trust and planning, transforming how families
              live and thrive together.
            </p>
          </div>
        </div>

        {/* Who We Are */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div className="order-2 md:order-1">
            <Image
              src="/be-the-change.jpg"
              alt="Be The Change"
              width={500}
              height={400}
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Who We Are</h2>
            <p className="text-gray-700 mb-6">
              We are a dedicated NGO committed to empowering families through education and technology. Our journey
              began when we noticed recurring issues within our circle of family, friends, and colleagues—problems like
              lack of communication, unplanned emergencies, disputes over assets, and poor succession planning.
            </p>
            <p className="text-gray-700 mb-6">
              These challenges inspired us to create a solution that focuses on social change rather than profit. We aim
              to help families stay connected, organized, and prepared for life's uncertainties by leveraging the power
              of technology in a meaningful way.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button className="bg-blue-900 hover:bg-blue-800">Register Now</Button>
              </Link>
              <Link href="/contact-us">
                <Button variant="outline" className="border-blue-300 text-blue-700">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
