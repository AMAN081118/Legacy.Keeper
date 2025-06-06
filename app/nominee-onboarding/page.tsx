"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getNomineeDetails } from "../actions/nominee-onboarding"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface NomineeDetails {
  id: string
  name: string
  inviterName: string
  inviterEmail: string
  inviterProfileUrl?: string | null
}

export default function NomineeOnboarding() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nomineeDetails, setNomineeDetails] = useState<NomineeDetails | null>(null)

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token")
      setLoading(false)
      return
    }

    async function loadNomineeDetails() {
      try {
        const details = await getNomineeDetails(token as string)
        if (details.success && details.data) {
          setNomineeDetails(details.data as NomineeDetails)
        } else {
          setError(details.error || "Failed to load nominee details")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadNomineeDetails()
  }, [token])

  const handleContinue = () => {
    router.push(`/nominee-onboarding/status?token=${token}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !nomineeDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">{error || "Failed to load nominee details"}</p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with globe */}
      <div className="bg-blue-900 text-white p-8 flex flex-col justify-between md:w-2/5">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <h1 className="text-2xl font-bold">Trustee Hub</h1>
          </div>
        </div>
        {/* <div className="flex-grow flex items-center justify-center">
          <DotGlobe className="w-full h-64 md:h-96" />
        </div> */}
      </div>

      {/* Right side with content */}
      <div className="p-8 flex flex-col justify-center md:w-3/5">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Hello <span className="text-green-600">{nomineeDetails.name}</span>, Welcome to the Trustee Hub!
          </h2>

          <p className="text-gray-600 mb-8">
            You have been nominated as a <span className="font-semibold">Nominee</span> by one of the users
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2">
              {nomineeDetails.inviterProfileUrl ? (
                <Image
                  src={nomineeDetails.inviterProfileUrl || "/placeholder.svg"}
                  alt={nomineeDetails.inviterName}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-xl font-bold">
                  {nomineeDetails.inviterName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="font-medium text-center">{nomineeDetails.inviterName}</p>
          </div>

          <Button onClick={handleContinue} className="w-full bg-blue-900 hover:bg-blue-800">
            Continue to Know Responsibilities
          </Button>
        </div>
      </div>
    </div>
  )
}
