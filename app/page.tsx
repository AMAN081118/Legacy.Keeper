"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegistrationForm } from "@/components/registration-form"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function Home() {
  const [tab, setTab] = useState("register")
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with PNG image */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-screen">
        <Image
          src="/login-ss.png"
          alt="Login Illustration"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {/* Right side with forms */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
              <RegistrationForm onSwitchToLogin={() => setTab("login")} />
            </TabsContent>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
