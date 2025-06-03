"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import Image from "next/image"

interface TrusteeDetails {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  profilePhotoUrl?: string
  inviter: {
    name: string
    email: string
    profilePhotoUrl?: string
  }
}

export default function TrusteeOnboarding() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trusteeDetails, setTrusteeDetails] = useState<TrusteeDetails | null>(null)

  useEffect(() => {
    const fetchTrusteeDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use session-based approach instead of email parameter
        const response = await fetch('/api/trustee-onboarding/session')
        const result = await response.json()

        if (!result.success) {
          setError(result.error || "Failed to fetch trustee details")
          return
        }

        setTrusteeDetails(result.data)
      } catch (err) {
        console.error("Error fetching trustee details:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTrusteeDetails()
  }, [])

  const handleContinue = () => {
    router.push("/trustee-onboarding/instructions?step=1")
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trustee details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {error.includes("User not authenticated") ? (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Please log in to access the trustee onboarding page.
              </p>
              <Button onClick={() => router.push("/login")} className="bg-blue-900 hover:bg-blue-800 mr-2">
                Go to Login
              </Button>
            </div>
          ) : (
            <Button onClick={() => window.location.reload()} className="bg-blue-900 hover:bg-blue-800">
              Try Again
            </Button>
          )}
        </div>
      </div>
    )
  }

  // No trustee details found
  if (!trusteeDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Details Found</h2>
          <p className="text-gray-600">Unable to load trustee information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with handshake or globe */}
      <div className="bg-blue-900 text-white p-8 flex flex-col justify-between md:w-2/5 min-h-[300px]">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <h1 className="text-2xl font-bold">Trustee Hub</h1>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          {/* Handshake image for first step, globe for second step */}
          <Image
            src="/placeholder.jpg" // TODO: Replace with handshake image if available
            alt="Handshake"
            width={400}
            height={300}
            className="object-cover w-full h-64 md:h-80 rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Right side with content */}
      <div className="p-8 flex flex-col justify-center md:w-3/5 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Hello <span className="text-green-600">{trusteeDetails.name}</span>, Welcome to the Trustee Hub!
          </h2>

          <p className="text-gray-600 mb-8">
            You have been nominated as a <span className="font-semibold">Trustee</span> by one of the users
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2">
              {trusteeDetails.inviter.profilePhotoUrl ? (
                <Image
                  src={trusteeDetails.inviter.profilePhotoUrl}
                  alt={trusteeDetails.inviter.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-xl font-bold">
                  {trusteeDetails.inviter.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="font-medium text-center">{trusteeDetails.inviter.name}</p>
            <p className="text-sm text-gray-500 text-center">{trusteeDetails.relationship}</p>
          </div>

          <p className="text-gray-700 mb-8 text-center">
            This nomination reflects the user's trust in you as a reliable and responsible individual. As a Trustee, your role is to assist in sharing critical information about the user with his/her designated nominees during emergencies, such as illness or death.
          </p>

          <Button onClick={handleContinue} className="w-full bg-blue-900 hover:bg-blue-800">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}