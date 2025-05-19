import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FileUpload } from "@/components/file-upload"

export default async function ProfilePage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-sm text-gray-500">Manage your account information</p>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="mt-1">{userData?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1">{userData?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="mt-1">{userData?.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="mt-1">{userData?.dob || "Not provided"}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Gender</p>
            <p className="mt-1">{userData?.gender || "Not provided"}</p>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-medium">Government ID</h2>
            {userData?.government_id_url ? (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Your government ID has been uploaded.</p>
                <img
                  src={userData.government_id_url || "/placeholder.svg"}
                  alt="Government ID"
                  className="mt-2 max-h-40 rounded border"
                />
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-4">Please upload your government ID to complete your profile.</p>
                <FileUpload userId={session.user.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
