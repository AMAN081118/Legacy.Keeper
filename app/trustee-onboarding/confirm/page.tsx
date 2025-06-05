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

export default function TrusteeConfirm() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processingAction, setProcessingAction] = useState<null | 'accept' | 'reject'>(null)
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

  const handleApprove = async () => {
    if (!trusteeDetails) return
    try {
      setProcessingAction('accept')
      const response = await fetch("/api/trustee-onboarding/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trusteeId: trusteeDetails.id }),
      })
      const result = await response.json()
      if (result.success) {
        alert("Trustee invitation accepted successfully! You are now a trustee.")
        router.push("/dashboard")
      } else {
        setError(result.error || "Failed to accept invitation")
      }
    } catch (err) {
      console.error("Error accepting invitation:", err)
      setError("An unexpected error occurred")
    } finally {
      setProcessingAction(null)
    }
  }

  const handleReject = async () => {
    if (!trusteeDetails) return
    try {
      setProcessingAction('reject')
      const response = await fetch("/api/trustee-onboarding/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trusteeId: trusteeDetails.id }),
      })
      const result = await response.json()
      if (result.success) {
        alert("Trustee invitation rejected successfully.")
        router.push("/")
      } else {
        setError(result.error || "Failed to reject invitation")
      }
    } catch (err) {
      console.error("Error rejecting invitation:", err)
      setError("An unexpected error occurred")
    } finally {
      setProcessingAction(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {error.includes("User not authenticated") ? (
            <Button onClick={() => router.push("/login")} className="bg-blue-900 hover:bg-blue-800">
              Go to Login
            </Button>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Details Found</h2>
          <p className="text-gray-600">Unable to load trustee information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <h1 className="text-2xl font-bold">Trustee Hub</h1>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Are you ready to accept this request to<br />be <span className="text-green-600">{trusteeDetails.inviter.name}'s</span> Trustee?
          </h2>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 mb-2">
            {trusteeDetails.inviter.profilePhotoUrl ? (
              <Image
                src={trusteeDetails.inviter.profilePhotoUrl}
                alt={trusteeDetails.inviter.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-3xl font-bold">
                {trusteeDetails.inviter.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="font-medium text-center text-lg">{trusteeDetails.inviter.name}</p>
          <p className="text-sm text-gray-500 text-center">{trusteeDetails.relationship}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg mb-6 w-full">
          <h3 className="font-semibold text-gray-900 mb-2">Your Details:</h3>
          <p className="text-sm text-gray-600">Name: <span className="font-medium">{trusteeDetails.name}</span></p>
          <p className="text-sm text-gray-600">Email: <span className="font-medium">{trusteeDetails.email}</span></p>
          {trusteeDetails.phone && (
            <p className="text-sm text-gray-600">Phone: <span className="font-medium">{trusteeDetails.phone}</span></p>
          )}
        </div>
        <div className="flex gap-4 w-full max-w-xs mx-auto">
          <Button onClick={handleApprove} disabled={processingAction === 'accept'} className="w-full mb-4">
            {processingAction === 'accept' ? 'Accepting...' : 'Accept Invitation'}
          </Button>
          <Button onClick={handleReject} disabled={processingAction === 'reject'} variant="outline" className="w-full">
            {processingAction === 'reject' ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  )
}