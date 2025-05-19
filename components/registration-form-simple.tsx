"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, User, Mail, Phone, Calendar, Lock } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerUser } from "@/app/actions/auth"
import { useFormState } from "react-dom"

const initialState = { error: null }

export function RegistrationFormSimple() {
  const [state, formAction] = useFormState(registerUser, initialState)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [gender, setGender] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFileName(file.name)
    }
  }

  const handleLoginClick = () => {
    const loginTab = document.querySelector('[value="login"]') as HTMLButtonElement
    if (loginTab) loginTab.click()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Legacy keeper</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your All-in-One Solution for Secure Financial Management, Investments, and Loan Tracking
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input id="name" name="name" placeholder="Username" className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Username123@gmail.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="flex gap-2">
            <Select defaultValue="91">
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
              <Input id="phone" name="phone" type="tel" placeholder="12345 67890" className="pl-10" required />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="dob"
              name="dob"
              type="date"
              className="pl-10"
              required
              max={new Date().toISOString().split("T")[0]}
              min="1900-01-01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <input type="hidden" name="gender" value={gender} />
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

        <Button type="submit" className="w-full bg-[#0a2642] hover:bg-[#0a2642]/90">
          Register
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
