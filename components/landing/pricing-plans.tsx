"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PricingPlans() {
  const router = useRouter()
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(9)
  const [minutes, setMinutes] = useState(8)
  const [seconds, setSeconds] = useState(5)

  const handleSubscribe = (plan: string) => {
    // Redirect to registration page with plan info
    router.push(`/registration?plan=${plan}`)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      } else if (minutes > 0) {
        setMinutes(minutes - 1)
        setSeconds(59)
      } else if (hours > 0) {
        setHours(hours - 1)
        setMinutes(59)
        setSeconds(59)
      } else if (days > 0) {
        setDays(days - 1)
        setHours(23)
        setMinutes(59)
        setSeconds(59)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [days, hours, minutes, seconds])

  return (
    <section className="w-full py-16 px-4 bg-blue-50/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
            <span className="text-gray-600">Our Plans</span>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Choose a <span className="text-green-600">Plan That's Right</span> For You
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Legacy Keeper offers comprehensive plans that cater to different needs and budgets. From the free trial to
            our premium offering, we provide solutions designed to help you manage and protect your family's important
            information.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Trial */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Free Trial</h2>
              <div className="flex items-center mb-4">
                <span className="text-4xl font-bold">₹0</span>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  15 Days
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold mb-2">Highlights</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Access to basic features like Transactions, Document Store, Health Records, and Family Vault for free.
                </p>
              </div>
              <Button className="w-full bg-blue-900 hover:bg-blue-800">Get Started</Button>
            </div>
          </div>

          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Basic</h2>
              <div className="flex items-center mb-1">
                <span className="text-4xl font-bold">₹600</span>
                <span className="ml-2 text-gray-500 line-through">₹1200</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">Annual</div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold mb-2">Highlights</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Access all essential features for a discounted price of ₹600 (originally 1,200). A great deal for
                  organizing your life efficiently!
                </p>
              </div>
              <Button 
                className="w-full bg-blue-900 hover:bg-blue-800"
                onClick={() => handleSubscribe("Basic")}
              >
                Subscribe Now
              </Button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-green-500 relative">
            <div className="absolute top-0 right-0">
              <div className="bg-green-500 text-white px-4 py-1 text-sm font-medium">Popular</div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2 text-yellow-600">Premium</h2>
              <div className="flex items-center mb-1">
                <span className="text-4xl font-bold">₹1500</span>
                <span className="ml-2 text-gray-500 line-through">₹3000</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">Annual</div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="font-semibold mb-2">Highlights</h3>
                <p className="text-sm text-gray-700 mb-4">
                  All essential features plus premium benefits like Debts & Loans management, Deposits & Investments,
                  Succession Plans, and Special Messages.
                </p>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleSubscribe("Premium")}
              >
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
          <div className="grid grid-cols-4 border-b">
            <div className="p-4 font-semibold">Features</div>
            <div className="p-4 text-center font-semibold">Free Trial</div>
            <div className="p-4 text-center font-semibold">Basic Plan</div>
            <div className="p-4 text-center font-semibold">Premium</div>
          </div>

          {/* Feature rows */}
          {[
            { name: "Transactions", free: true, basic: true, premium: true },
            { name: "Document Store", free: true, basic: true, premium: true },
            { name: "Health Records", free: true, basic: true, premium: true },
            { name: "Digital Accounts", free: true, basic: true, premium: true },
            { name: "Debts and Loans", free: false, basic: false, premium: true },
            { name: "Deposits & Investments", free: false, basic: false, premium: true },
            { name: "Succession Plans", free: false, basic: false, premium: true },
            { name: "Special Messages", free: false, basic: false, premium: true },
          ].map((feature, index) => (
            <div key={index} className={`grid grid-cols-4 ${index % 2 === 0 ? "bg-gray-50" : ""}`}>
              <div className="p-4 border-t">{feature.name}</div>
              <div className="p-4 flex justify-center items-center border-t">
                {feature.free ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
              </div>
              <div className="p-4 flex justify-center items-center border-t">
                {feature.basic ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
              </div>
              <div className="p-4 flex justify-center items-center border-t">
                {feature.premium ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Limited Time Offer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-orange-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Limited Time Offer</h3>
              </div>
              <p className="text-gray-700">
                <span className="font-semibold">Take charge of your family's future today!</span> We're offering an{" "}
                <span className="text-green-600 font-semibold">exclusive discounted rate</span> for the first 1000
                subscribers. Don't miss out—secure your family's future by signing up now!
              </p>
            </div>

            <div className="flex space-x-2">
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {days}
              </div>
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {hours.toString().padStart(2, "0")}
              </div>
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {minutes.toString().padStart(2, "0")}
              </div>
              <div className="bg-gray-200 rounded p-3 w-12 h-16 flex items-center justify-center text-2xl font-bold">
                {seconds.toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button className="bg-blue-900 hover:bg-blue-800 px-8 py-3">Register Now</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
