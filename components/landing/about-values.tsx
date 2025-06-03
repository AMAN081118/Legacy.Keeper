import Image from "next/image"

export function AboutValues() {
  return (
    <section className="w-full py-16 px-4 bg-blue-50/50">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">Why Choose Us?</h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Legacy Keeper stands apart from other platforms through our commitment to families, security, and social
          impact.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            {/* A Social Mission, Not a Business */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-purple-700 mb-2">A Social Mission, Not a Business</h3>
              <p className="text-gray-700">We are driven by a passion for creating societal change, not profits.</p>
            </div>

            {/* Family-Focused Solutions */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-green-700 mb-2">Family-Focused Solutions</h3>
              <p className="text-gray-700">
                Our platform is designed to address real-life challenges faced by modern families, from financial
                planning to health management.
              </p>
            </div>

            {/* Empowering Through Technology */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-blue-700 mb-2">Empowering Through Technology</h3>
              <p className="text-gray-700">
                We use technology to simplify complex problems, ensuring your family is always prepared for all
                eventualities.
              </p>
            </div>

            {/* Secure and Trustworthy */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-red-700 mb-2">Secure and Trustworthy</h3>
              <p className="text-gray-700">
                Your privacy and data security are our top priorities. We ensure your information is protected from
                unauthorized access.
              </p>
            </div>

            {/* A Movement for All */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-amber-700 mb-2">A Movement for All</h3>
              <p className="text-gray-700">
                This isn't just about you—it's about creating a ripple effect. Invite others to join and make a lasting
                impact.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src="/do-what-matters.jpg"
              alt="Do What Matters"
              width={400}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
