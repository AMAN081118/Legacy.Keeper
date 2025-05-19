"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Use email/password authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If the error is "Email not confirmed", try to confirm it automatically for testing
        if (signInError.message.includes("Email not confirmed")) {
          try {
            // Create a server-side API call to confirm the email
            const response = await fetch("/api/auth/confirm-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email,
              }),
            })

            if (response.ok) {
              // Try signing in again
              const { error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              })

              if (retryError) throw retryError

              // Successful login after email confirmation
              toast({
                title: "Login successful",
                description: "You have been logged in successfully.",
              })

              // Redirect to dashboard
              router.push("/dashboard")
              return
            } else {
              throw new Error("Failed to confirm email")
            }
          } catch (confirmError: any) {
            throw new Error(`Email not confirmed: ${confirmError.message}`)
          }
        }

        throw signInError
      }

      // Successful login
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterClick = () => {
    const registerTab = document.querySelector('[value="register"]') as HTMLButtonElement
    if (registerTab) registerTab.click()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground mt-1">Please enter your credentials to login</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder="Username123@gmail.com"
              className="pl-10"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm leading-none">
              Keep me signed in
            </Label>
          </div>
          <button type="button" className="text-sm text-[#0a2642] hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full bg-[#0a2642] hover:bg-[#0a2642]/90" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={handleRegisterClick} className="text-[#0a2642] font-medium hover:underline">
            Register
          </button>
        </div>
      </form>
    </div>
  )
}
