"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"

export function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("premium")

  return (
    <section className="w-full py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Pricing Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6">
            <span className="text-gray-600">Pricing</span>
          </div>
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">Simple Pricing Plan</h2>
          <p className="text-center text-gray-600 max-w-3xl">
            Choose the plan that works best for you and your family. All plans include our core features to help you
            manage and share your important information securely.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-r rounded-lg overflow-hidden">
          {/* Free Trial */}
          <div 
            className={`border-r border-b p-8 bg-white cursor-pointer ${selectedPlan === "free" ? "border-2 border-green-500 rounded-lg" : ""}`}
            onClick={() => setSelectedPlan("free")}>

            <div className="flex flex-col h-full">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h3 className="text-2xl font-bold">Free Trial</h3>
                  <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    15 Days
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">₹0</span>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-4">Highlights</h4>
                  <p className="text-sm text-gray-700">
                    Explore essential features like{" "}
                    <span className="font-medium">
                      Transactions, Document Store, Health Records, Family Vault, and Digital Accounts for free
                    </span>
                    . Perfect for getting started with the platform.
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <Button className="w-full bg-blue-900 hover:bg-blue-800">Get Started</Button>
              </div>
            </div>
          </div>

          {/* Basic */}
          <div 
            className={`border-r border-b p-8 bg-white cursor-pointer ${selectedPlan === "basic" ? "border-2 border-green-500 rounded-lg" : ""}`}
            onClick={() => setSelectedPlan("basic")}>

            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-green-700 mb-4">Basic</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">₹600</span>
                  <span className="text-lg text-gray-500 line-through ml-2">₹1200</span>
                </div>
                <div className="text-gray-600 mb-6">Annual</div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-4">Highlights</h4>
                  <p className="text-sm text-gray-700">
                    Access{" "}
                    <span className="font-medium">
                      all essential features for a discounted price of ₹600 (originally 1,200)
                    </span>
                    . A great deal for organizing your life efficiently!
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <Button className="w-full bg-blue-900 hover:bg-blue-800">Get Started</Button>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div 
            className={`border-b p-8 bg-white relative cursor-pointer ${selectedPlan === "premium" ? "border-2 border-green-500 rounded-lg" : ""}`}
            onClick={() => setSelectedPlan("premium")}>
            <div className="absolute top-0 right-0">
              <div className="bg-green-500 text-white px-4 py-1 text-sm font-medium">Popular</div>
            </div>
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-yellow-600 mb-4">Premium</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">₹1500</span>
                  <span className="text-lg text-gray-500 line-through ml-2">₹3000</span>
                </div>
                <div className="text-gray-600 mb-6">Annual</div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-4">Highlights</h4>
                  <p className="text-sm text-gray-700">
                    Access{" "}
                    <span className="font-medium">
                      all essential features for a discounted price of ₹600 (originally 1,200)
                    </span>
                    . A great deal for organizing your life efficiently!
                  </p>
                </div>
              </div>
              <div className="mt-auto">
                <Button className="w-full bg-blue-900 hover:bg-blue-800">Get Started</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
