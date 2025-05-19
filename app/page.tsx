"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RegistrationForm } from "@/components/registration-form"
import { LoginForm } from "@/components/login-form"
import { DotGlobe } from "@/components/dot-globe"

export default function Home() {
  const [tab, setTab] = useState("register")
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with globe visualization */}
      <div className="relative flex w-full flex-col items-center justify-center bg-[#0a2642] p-6 md:w-5/12 md:min-h-screen">
        <div className="relative h-64 w-64 md:h-96 md:w-96 lg:h-[450px] lg:w-[450px]">
          <DotGlobe />
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">"Explore Positive Change"</h2>
          <p className="mt-4 max-w-md text-white/80 hidden md:block">
            Set and track your savings, budgeting, and financial milestones. Stay organized and achieve your goals
            faster.
          </p>
        </div>
        <div className="absolute bottom-6 flex space-x-2">
          <span className="h-2 w-2 rounded-full bg-white opacity-100"></span>
          <span className="h-2 w-2 rounded-full bg-white opacity-50"></span>
          <span className="h-2 w-2 rounded-full bg-white opacity-50"></span>
        </div>
      </div>

      {/* Right side with forms */}
      <div className="flex w-full items-center justify-center p-6 md:w-7/12">
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
