"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { verifyInvitation } from "@/app/actions/nominee-onboarding"
import Image from "next/image"

export default function ConfirmNomination() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const token = searchParams.get("token")
  const inviterName = searchParams.get("inviterName") || "the user"
  const inviterPhoto = searchParams.get("inviterPhoto") || ""

  const handleAction = async (action: "accept" | "reject") => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation token",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await verifyInvitation(token, action)
      if (result.success) {
        toast({
          title: action === "accept" ? "Nomination Accepted" : "Nomination Rejected",
          description:
            action === "accept"
              ? "You have successfully accepted the nomination."
              : "You have rejected the nomination.",
        })
        // Redirect to a success page or dashboard
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to process your request",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/nominee-onboarding/access?token=${token}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 text-blue-900"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-6">Trustee Hub</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-center mb-6">
          Are you ready to accept this request to be this User's <span className="text-green-600">Nominee</span>
        </h2>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {inviterPhoto ? (
              <Image
                src={inviterPhoto || "/placeholder.svg"}
                alt={inviterName}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-800 text-2xl font-bold">
                {inviterName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <p className="text-center mb-8">{inviterName}</p>

        <div className="flex gap-4 mt-4">
          <Button onClick={handleBack} variant="outline" className="flex-1 text-blue-900 border-blue-900">
            Back
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => handleAction("reject")} disabled={loading}>
            Reject
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleAction("accept")}
            disabled={loading}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}
