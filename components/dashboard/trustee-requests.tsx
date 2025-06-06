"use client"
import { useEffect, useState } from "react"
import { useRole } from "@/components/dashboard/role-context"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Dialog } from "@/components/ui/dialog"

interface Nominee {
  id: string
  name: string
  email: string
  relationship: string
  phone: string
  profile_photo_url?: string | null
  status: string
}

// Add a function to send a request to a nominee (mocked for now)
async function sendNomineeRequest(nomineeId: string, refreshNominees: () => void) {
  try {
    const res = await fetch("/api/send-nominee-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId }),
    });
    if (!res.ok) throw new Error("Failed to send request");
    refreshNominees();
  } catch (e) {
    // Optionally show error
  }
}

// Add a function to add a nominee (mocked for now)
async function addNominee(nomineeId: string) {
  // TODO: Replace with actual API call
  // For now, just simulate a delay
  return new Promise((resolve) => setTimeout(resolve, 500));
}

// Add this function near the top
async function addNomineeRole(nomineeId: string, refreshNominees: () => void, setAdding: (id: string | null) => void) {
  setAdding(nomineeId);
  try {
    const res = await fetch("/api/add-nominee-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomineeId }),
    });
    if (!res.ok) throw new Error("Failed to add nominee role");
    refreshNominees();
  } catch (e) {
    // Optionally show error
  } finally {
    setAdding(null);
  }
}

export default function TrusteeRequests() {
  const { currentRole } = useRole()
  const [loading, setLoading] = useState(false)
  const [nominees, setNominees] = useState<Nominee[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [approvalType, setApprovalType] = useState<string | null>(null)
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [addingNominee, setAddingNominee] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user's name
    async function fetchCurrentUserName() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user?.user_metadata?.name) {
        setCurrentUserName(userData.user.user_metadata.name)
      } else if (userData?.user?.email) {
        setCurrentUserName(userData.user.email)
      } else {
        setCurrentUserName("Trustee")
      }
    }
    fetchCurrentUserName()
  }, [])

  useEffect(() => {
    if (!currentRole || currentRole.name !== "trustee" || !currentRole.relatedUser?.email) return
    setLoading(true)
    setError(null)
    fetch(`/api/trustee-nominee-requests?userEmail=${encodeURIComponent(currentRole.relatedUser.email)}`)
      .then(res => res.json())
      .then(data => {
        setNominees(data.nominees || [])
      })
      .catch(() => setError("Failed to load nominee requests"))
      .finally(() => setLoading(false))

    // Fetch approval_type from trustees table
    async function fetchApprovalType() {
      const supabase = createClient()
      // Get current user's email
      const { data: userData } = await supabase.auth.getUser()
      const trusteeEmail = userData?.user?.email
      if (!trusteeEmail || !currentRole?.relatedUser?.email) return
      // Find the trustee record where email = current user's email and user_id = inviter's id
      // First, get inviter's user id
      const { data: inviter } = await supabase.from("users").select("id").eq("email", currentRole.relatedUser.email).single()
      if (!inviter?.id) return
      const { data: trustee } = await supabase.from("trustees").select("approval_type").eq("email", trusteeEmail).eq("user_id", inviter.id).single()
      if (trustee?.approval_type) setApprovalType(trustee.approval_type)
    }
    fetchApprovalType()
  }, [currentRole])

  // Add a function to refresh nominees
  const refreshNominees = async () => {
    if (!currentRole || currentRole.name !== "trustee" || !currentRole.relatedUser?.email) return;
    setLoading(true);
    setError(null);
    fetch(`/api/trustee-nominee-requests?userEmail=${encodeURIComponent(currentRole.relatedUser.email)}`)
      .then(res => res.json())
      .then(data => {
        setNominees(data.nominees || []);
      })
      .catch(() => setError("Failed to load nominee requests"))
      .finally(() => setLoading(false));
  };

  if (!currentRole || currentRole.name !== "trustee") return null
  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  // Approval logic helpers
  const isGroup = approvalType?.toLowerCase().includes("group");
  const isIndividual = approvalType?.toLowerCase().includes("individual");
  const isNoRequest = approvalType?.toLowerCase().includes("no request");

  // For group: all must be accepted
  const allAccepted = nominees.length > 0 && nominees.every(n => n.status === "accepted");

  // For individual: allow add if accepted
  // For no request: allow add always

  return (
    <div className="p-6 border rounded-lg bg-white mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>{approvalType ? approvalType : "Group Request Approval"}</span>
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 text-sm text-gray-700">
          This Section outlines the group request approval process: Access to specific user information will only be granted if all individual requests from the Nominees are submitted. Once all the requests are received, the Trustee is required to approve/reject the group request for access to user information
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Dear {currentUserName || "Trustee"}</h3>
        <p className="text-gray-700 text-sm">You got below requests from the nominees of the user for whom you were appointed as trustee. Please go through their details clearly and then take the desired action needed. You can refer to the guidelines related to "Group Request Approval" if needed.</p>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        {nominees.map(nominee => (
          <div key={nominee.id} className={`rounded-lg p-4 flex flex-col items-center w-48 shadow ${nominee.status === "pending" ? "bg-green-50 border-green-200 border" : nominee.status === "accepted" ? "bg-blue-50 border-blue-200 border" : "bg-red-50 border-red-200 border"}`}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-2 flex items-center justify-center">
              {nominee.profile_photo_url ? (
                <Image src={nominee.profile_photo_url} alt={nominee.name} width={80} height={80} className="object-cover w-full h-full" />
              ) : (
                <span className="text-3xl font-bold text-gray-600">{nominee.name?.charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="font-bold text-center">{nominee.name}</div>
            <div className="text-xs font-semibold mt-1">
              {nominee.status === "pending" && <span className="text-yellow-700">Request Pending</span>}
              {nominee.status === "accepted" && <span className="text-green-700">Accepted</span>}
              {nominee.status === "rejected" && <span className="text-red-700">Rejected</span>}
            </div>
            <div className="text-xs text-blue-700 underline cursor-pointer mt-2" onClick={() => { setSelectedNominee(nominee); setModalOpen(true); }}>View Nominee Details</div>
            {/* Request/Action Buttons */}
            <div className="mt-2 flex flex-col gap-2 w-full">
              {/* Send Request Button (if not sent and not no-request) */}
              {!isNoRequest && nominee.status === "none" && (
                <button
                  className="w-full bg-blue-600 text-white rounded px-2 py-1 text-xs hover:bg-blue-700 disabled:opacity-50"
                  disabled={sendingRequest === nominee.id}
                  onClick={async () => {
                    setSendingRequest(nominee.id);
                    await sendNomineeRequest(nominee.id, refreshNominees);
                    setSendingRequest(null);
                  }}
                >
                  {sendingRequest === nominee.id ? "Sending..." : "Send Request"}
                </button>
              )}
              {/* Add as Nominee Button */}
              {((isNoRequest) || (isIndividual && nominee.status === "accepted") || (isGroup && allAccepted)) && (
                <button
                  className="w-full bg-green-600 text-white rounded px-2 py-1 text-xs hover:bg-green-700 disabled:opacity-50"
                  disabled={addingNominee === nominee.id || (isGroup && !allAccepted)}
                  onClick={() => addNomineeRole(nominee.id, refreshNominees, setAddingNominee)}
                >
                  {addingNominee === nominee.id ? "Adding..." : "Add as Nominee"}
                </button>
              )}
            </div>
            {/* If nominee.status === "added", you can show a badge or message instead of the button */}
            {nominee.status === "added" && (
              <span className="text-green-600 font-semibold">Nominee Added</span>
            )}
          </div>
        ))}
      </div>
      <div className="mb-4 text-yellow-700 bg-yellow-100 p-2 rounded text-xs">
        <b>Note:</b> The "Approve" and "Reject" Buttons will be enabled only if all the nominee requests are received. You can approve/reject after that.
      </div>
      <div className="flex gap-4">
        <Button disabled={!allAccepted} className="bg-red-600 hover:bg-red-700">Reject</Button>
        <Button disabled={!allAccepted} className="bg-green-600 hover:bg-green-700">Approve</Button>
      </div>

      {/* Nominee Details Modal */}
      {selectedNominee && modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Nominee Details</h2>
              <div className="flex flex-col items-center mb-4">
                {selectedNominee.profile_photo_url ? (
                  <Image src={selectedNominee.profile_photo_url} alt={selectedNominee.name} width={80} height={80} className="object-cover w-20 h-20 rounded-full mb-2" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-600">{selectedNominee.name?.charAt(0).toUpperCase() || '?'}</span>
                  </div>
                )}
                <div className="font-bold text-lg">{selectedNominee.name}</div>
                <div className="text-sm text-gray-600">{selectedNominee.email}</div>
              </div>
              <div className="space-y-2">
                <div><b>Relationship:</b> {selectedNominee.relationship}</div>
                <div><b>Phone:</b> {selectedNominee.phone}</div>
                <div><b>Status:</b> {selectedNominee.status}</div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
} 