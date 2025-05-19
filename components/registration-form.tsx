"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, User, Mail, Phone, Calendar, Lock } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function RegistrationForm({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [gender, setGender] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    governmentIdUrl: null as File | null,
    countryCode: "91",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id.replace("registration-", "")]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFileName(file.name)
      setFormData((prev) => ({
        ...prev,
        governmentIdUrl: file,
      }))
    }
  }

  const handleCountryCodeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, countryCode: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            dob: formData.dob,
            gender: gender,
            has_pending_id_upload: formData.governmentIdUrl ? true : false,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) throw signUpError

      // For testing purposes, let's automatically confirm the email
      // In a production environment, you would remove this and let users confirm their email
      try {
        // Create a server-side API call to confirm the email
        const response = await fetch("/api/auth/confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        })

        if (!response.ok) {
          const result = await response.json()
          console.warn("Email confirmation warning:", result.error)
          // We'll continue even if this fails
        }
      } catch (confirmError) {
        console.warn("Email confirmation warning:", confirmError)
        // We'll continue even if this fails
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      })

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoginClick = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Legacy keeper</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your All-in-One Solution for Secure Financial Management, Investments, and Loan Tracking
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="registration-name">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="registration-name"
              placeholder="Username"
              className="pl-10"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="registration-email"
              type="email"
              placeholder="Username123@gmail.com"
              className="pl-10"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="registration-password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              required
              value={formData.password}
              onChange={handleInputChange}
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration-phone">Phone number</Label>
          <div className="flex gap-2">
            <Select value={formData.countryCode} onValueChange={handleCountryCodeChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="+91" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">+1</SelectItem>
                <SelectItem value="44">+44</SelectItem>
                <SelectItem value="91">+91</SelectItem>
                <SelectItem value="61">+61</SelectItem>
                <SelectItem value="86">+86</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="registration-phone"
                type="tel"
                placeholder="12345 67890"
                className="pl-10"
                required
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registration-dob">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="registration-dob"
              type="date"
              className="pl-10"
              required
              max={new Date().toISOString().split("T")[0]}
              min="1900-01-01"
              value={formData.dob}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <RadioGroup value={gender} onValueChange={setGender} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="government-id">Government ID</Label>
          <div className="border-2 border-dashed border-blue-300 rounded-md p-6 text-center">
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & Drop files here</p>
              <p className="text-xs text-muted-foreground mt-1">Supported format : pdf, jpg, jpeg.</p>
              <p className="text-xs text-muted-foreground mt-1">Or</p>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 bg-[#0a2642] text-white hover:bg-[#0a2642]/90"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Browse Files
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg"
                onChange={handleFileChange}
              />
              {fileName && <p className="text-xs mt-2 text-green-600">File selected: {fileName}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" required />
          <Label htmlFor="terms" className="text-sm leading-none">
            By signing in or registering your account, you agree with our{" "}
            <Link href="#" className="text-[#0a2642] font-medium hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#0a2642] font-medium hover:underline">
              Privacy Statement
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full bg-[#0a2642] hover:bg-[#0a2642]/90" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>

        <div className="text-center text-sm">
          Already a user?{" "}
          <button type="button" onClick={handleLoginClick} className="text-[#0a2642] font-medium hover:underline">
            Login
          </button>
        </div>
      </form>
    </div>
  )
}
