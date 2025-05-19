"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { HealthRecord } from "@/lib/supabase/database.types"
import { format } from "date-fns"

interface ViewMemberModalProps {
  record: HealthRecord
  open: boolean
  onClose: () => void
}

export function ViewMemberModal({ record, open, onClose }: ViewMemberModalProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd-MM-yyyy")
    } catch (error) {
      return "Invalid Date"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member Name</h3>
              <p className="mt-1">{record.member_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
              <p className="mt-1">{record.dob ? formatDate(record.dob) : "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Gender</h3>
              <p className="mt-1">{record.gender || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Blood Group</h3>
              <p className="mt-1">{record.blood_group || "N/A"}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
            <p className="mt-1">{record.contact_number || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Emergency Contact</h3>
            <p className="mt-1">{record.emergency_contact || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Medical Conditions</h3>
            <p className="mt-1 whitespace-pre-wrap">{record.medical_conditions || "None"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
            <p className="mt-1 whitespace-pre-wrap">{record.allergies || "None"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Medications</h3>
            <p className="mt-1 whitespace-pre-wrap">{record.medications || "None"}</p>
          </div>

          {record.attachment_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Medical Records</h3>
              <div className="mt-1">
                <a
                  href={record.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
