"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Suspense } from "react"

const steps = [
  [
    "As a Trustee, you will not have direct access to the user's critical information stored in the app.",
    "You are entrusted with the authority to facilitate access to the user's information for their nominees.",
    "Your responsibility is to ensure that access is granted in accordance with the user's predefined instructions.",
  ],
  [
    "The nominees may or may not be aware of the information stored by the user on this app.",
    "Depending on the situation and need, you have the authority to notify nominees or approve their access to the information, strictly as specified by the user.",
    "Your role is crucial in ensuring that nominees are informed and supported during critical times.",
  ],
  [
    "You do not have the authority to modify or change the level of access defined for the nominees by the user.",
    "Your sole responsibility is to act as a facilitator, enabling nominees to access information as per the user's instructions.",
    "Thank you for taking on this important role and helping ensure that sensitive information is handled responsibly and securely.",
  ],
]

function TrusteeInstructionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = Number(searchParams.get("step") || 1)

  const handleNext = () => {
    if (step < steps.length) {
      router.push(`/trustee-onboarding/instructions?step=${step + 1}`)
    } else {
      router.push("/trustee-onboarding/confirm")
    }
  }
  const handlePrev = () => {
    if (step > 1) {
      router.push(`/trustee-onboarding/instructions?step=${step - 1}`)
    } else {
      router.push("/trustee-onboarding")
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left side with globe */}
      <div className="bg-blue-900 text-white p-8 flex flex-col justify-between md:w-2/5 min-h-[300px]">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <h1 className="text-2xl font-bold">Trustee Hub</h1>
          </div>
        </div>
      </div>

      {/* Right side with content */}
      <div className="p-8 flex flex-col justify-center md:w-3/5 bg-white">
        <div className="max-w-xl mx-auto w-full">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center">
                <div className={`h-2 w-12 rounded-full ${i + 1 <= step ? "bg-blue-900" : "bg-gray-200"}`}></div>
                {i < steps.length - 1 && <div className="w-2"></div>}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Onboarding Instructions</h2>
          <ul className="space-y-6 mb-8">
            {steps[step - 1].map((text, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="text-gray-700 text-lg">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between gap-4">
            <Button variant="outline" onClick={handlePrev} className="w-32">
              {step === 1 ? "Back" : "Previous"}
            </Button>
            <Button onClick={handleNext} className="w-32 bg-blue-900 hover:bg-blue-800">
              {step === steps.length ? "Next" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrusteeInstructions() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrusteeInstructionsContent />
    </Suspense>
  )
} 