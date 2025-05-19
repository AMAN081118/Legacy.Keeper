"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { DotGlobe } from "@/components/dot-globe"
import { Button } from "@/components/ui/button"

export default function NomineePrivacyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const handleNext = () => {
    router.push(`/nominee-onboarding/access?token=${token}`)
  }

  const handleBack = () => {
    router.push(`/nominee-onboarding/status?token=${token}`)
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side with globe */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <DotGlobe />
        </div>
        <div className="absolute top-8 left-8 flex items-center">
          <div className="text-white text-2xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-2">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
            Trustee Hub
          </div>
        </div>
      </div>

      {/* Right side with content */}
      <div className="w-full md:w-3/5 p-8 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <div className="md:hidden flex justify-center mb-8">
            <div className="text-blue-900 text-2xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-2">
                <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
              </svg>
              Trustee Hub
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex mb-8">
            <div className="h-1 bg-blue-900 flex-1"></div>
            <div className="h-1 bg-blue-900 flex-1"></div>
            <div className="h-1 bg-gray-200 flex-1"></div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Privacy Expectation</h2>

          <p className="text-gray-700 mb-6">
            You will have access to the user's personal and public information, which must be kept private and handled
            responsibly.
          </p>

          <h2 className="text-2xl font-bold mb-6">Requesting Access</h2>

          <p className="text-gray-700 mb-8">
            If needed, you can request access to specific sections of the user's information. Approval will depend on
            the level of access defined by the user, trustee, or, in some cases, the app owner.
          </p>

          <div className="flex justify-between">
            <Button onClick={handleBack} variant="outline" className="text-blue-900 border-blue-900 px-6 py-2 mr-2">
              Back
            </Button>
            <Button onClick={handleNext} className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
