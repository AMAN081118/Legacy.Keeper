"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      // Add your newsletter subscription logic here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      setStatus("success")
      setEmail("")
    } catch (error) {
      setStatus("error")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Subscribe to our newsletter
          </label>
          <div className="flex space-x-2">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
        </div>
        {status === "success" && (
          <p className="text-sm text-green-600">Successfully subscribed!</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  )
} 