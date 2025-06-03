"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSubscribe() {
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
    <section className="w-full py-16 px-4 bg-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-4">Keep In Touch</h2>
        <h3 className="text-2xl font-bold mb-6">Subscribe to our newsletter</h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet consectetur. Amet id diam quis dictum quis eget malesuada tellus. Viverra sagittis
          consectetur sed at. Ut nulla. Etiam convallis nunc mauris pellen tesque diam est sed mi.
        </p>

        <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-2 mb-4">
          <Input
            type="email"
            placeholder="Your Email"
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
    </section>
  )
}
