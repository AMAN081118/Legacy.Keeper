"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { verifyInvitation } from "@/app/actions/nominees"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function VerifyNomineePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [action, setAction] = useState<"accept" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setError("Invalid invitation link. No token provided.")
      return
    }
  }, [token])

  const handleAction = async (selectedAction: "accept" | "reject") => {
    try {
      setStatus("loading")
      const result = await verifyInvitation(token!, selectedAction)
      if (result.success) {
        setStatus("success")
        setAction(selectedAction)
      } else {
        setStatus("error")
        setError(result.error || "An unknown error occurred")
      }
    } catch (error) {
      setStatus("error")
      setError(String(error))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Nominee Invitation</CardTitle>
          <CardDescription>You have been invited to be a nominee</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && !action && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Verifying invitation...</p>
            </div>
          )}

          {status === "loading" && action && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Processing your response...</p>
            </div>
          )}

          {status === "success" && action === "accept" && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="mt-4 text-xl font-semibold">Invitation Accepted</h3>
              <p className="mt-2 text-gray-600">
                You have successfully accepted the invitation to be a nominee. Thank you!
              </p>
            </div>
          )}

          {status === "success" && action === "reject" && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <XCircle className="h-16 w-16 text-red-500" />
              <h3 className="mt-4 text-xl font-semibold">Invitation Declined</h3>
              <p className="mt-2 text-gray-600">You have declined the invitation to be a nominee.</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <h3 className="mt-4 text-xl font-semibold">Error</h3>
              <p className="mt-2 text-gray-600">{error || "An error occurred while processing your request."}</p>
            </div>
          )}

          {status === "loading" && !action && (
            <div className="flex flex-col space-y-4 mt-6">
              <p className="text-center text-gray-700">
                Would you like to accept or decline this nomination? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => handleAction("reject")}>
                  Decline
                </Button>
                <Button onClick={() => handleAction("accept")}>Accept</Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {(status === "success" || status === "error") && (
            <Button variant="outline" onClick={() => window.close()}>
              Close
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
