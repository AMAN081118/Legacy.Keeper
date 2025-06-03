"use client"

import { useEffect, useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const editableFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "dob", label: "Date of Birth", type: "date" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
]

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldValue, setFieldValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      setUserData(data)
    }
    fetchUser()
  }, [])

  const handleEdit = (key: string) => {
    setEditingField(key)
    setFieldValue(userData?.[key] || "")
    setError("")
  }

  const handleCancel = () => {
    setEditingField(null)
    setFieldValue("")
    setError("")
  }

  const handleSave = async (key: string) => {
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Not authenticated")
      setLoading(false)
      return
    }
    const updates: any = { [key]: fieldValue, updated_at: new Date().toISOString() }
    const { error } = await supabase.from("users").update(updates).eq("id", user.id)
    if (error) {
      setError("Failed to update. Please try again.")
    } else {
      setUserData((prev: any) => ({ ...prev, [key]: fieldValue }))
      setEditingField(null)
      setFieldValue("")
    }
    setLoading(false)
  }

  if (!userData) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-sm text-gray-500">Manage your account information</p>
      </div>

      <div className="rounded-lg border bg-white p-6 max-w-xl mx-auto">
        <div className="space-y-6">
          {/* Email (read-only) */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 font-medium">{userData.email}</p>
            </div>
            <span className="text-xs text-gray-400">(cannot edit)</span>
          </div>

          {/* Editable fields */}
          {editableFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between border-b pb-4">
            <div>
                <p className="text-sm font-medium text-gray-500">{field.label}</p>
                {editingField === field.key ? (
                  <div className="flex items-center gap-2 mt-1">
                    {field.type === "select" ? (
                      <select
                        className="border rounded px-2 py-1"
                        value={fieldValue}
                        onChange={e => setFieldValue(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="border rounded px-2 py-1"
                        value={fieldValue}
                        onChange={e => setFieldValue(e.target.value)}
                        disabled={loading}
                      />
                    )}
                    <Button size="icon" variant="ghost" onClick={() => handleSave(field.key)} disabled={loading}>
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={handleCancel} disabled={loading}>
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 font-medium">{userData[field.key] || "Not provided"}</p>
                )}
                {editingField === field.key && error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
            </div>
              {editingField !== field.key && (
                <button
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  onClick={() => handleEdit(field.key)}
                  disabled={loading}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              )}
            </div>
          ))}

          {/* Government ID */}
          <div className="pt-4">
            <h2 className="text-lg font-medium">Government ID</h2>
            {userData.government_id_url ? (
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
                <FileUpload 
                  onUploadComplete={async (url) => {
                    setLoading(true)
                    setError("")
                    const supabase = createClient()
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      setError("Not authenticated")
                      setLoading(false)
                      return
                    }
                    const updates: any = { government_id_url: url, updated_at: new Date().toISOString() }
                    const { error } = await supabase.from("users").update(updates).eq("id", user.id)
                    if (error) {
                      setError("Failed to update government ID. Please try again.")
                    } else {
                      setUserData((prev: any) => ({ ...prev, government_id_url: url }))
                    }
                    setLoading(false)
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                  bucket="user_documents"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
