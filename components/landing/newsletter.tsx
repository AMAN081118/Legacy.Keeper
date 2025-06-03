"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setMessage("Thank you for subscribing to our newsletter!")
      setEmail("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <section className="w-full py-16 px-4 bg-blue-50">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-center">
          <div className="inline-block rounded-full border border-gray-300 px-6 py-2 mb-6 bg-white">
            <span className="text-gray-600">Keep In Touch</span>
          </div>
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">Subscribe to our newsletter</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl">
            Stay updated with the latest features, tips, and news about Legacy Keeper. We'll send you valuable
            information to help you make the most of our platform.
          </p>

          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 mb-4">
            <Input
              type="email"
              placeholder="Input Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={isSubmitting}>
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          {message && <p className="text-green-600 mt-2">{message}</p>}
        </div>
      </div>
    </section>
  )
}
