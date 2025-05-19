import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
import { ChevronRight, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddHealthConditionModal } from "@/components/health-records/add-health-condition-modal"
import { getHealthConditions } from "@/app/actions/health-conditions"
import { EditHealthConditionModal } from "@/components/health-records/edit-health-condition-modal"

export default async function HealthRecordDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch the health record
  const { data: record, error } = await supabase.from("health_records").select("*").eq("id", params.id).single()

  if (error || !record) {
    notFound()
  }

  // Fetch health conditions for this record
  const healthConditions = await getHealthConditions(params.id)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MM/dd/yyyy")
    } catch (error) {
      return "Invalid Date"
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm">
        <Link href="/dashboard/health-records" className="text-gray-600 hover:text-gray-900">
          Health Records
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <span className="font-medium">{record.member_name}</span>
      </div>

      {/* Profile Details */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 flex-grow">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{record.member_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">DOB</p>
              <p className="font-medium">{formatDate(record.dob)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{record.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Blood Group</p>
              <p className="font-medium">{record.blood_group || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p className="font-medium">{record.contact_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Secondary Contact</p>
              <p className="font-medium">{record.secondary_contact || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Conditions */}
      <div>
        <h2 className="text-xl font-semibold">Health Conditions({healthConditions?.length || 0})</h2>
        <div className="bg-white rounded-lg border p-6 mt-4">
          {healthConditions && healthConditions.length > 0 ? (
            <div className="space-y-4">
              {healthConditions.map((condition) => (
                <div key={condition.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{condition.condition_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{condition.description || "No description provided"}</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {condition.doctor_name ? `Dr. ${condition.doctor_name}` : "No doctor specified"}
                      {condition.visit_date ? ` • ${formatDate(condition.visit_date)}` : ""}
                    </p>
                    <div className="flex gap-2">
                      <EditHealthConditionModal
                        condition={condition}
                        trigger={<button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>}
                      />
                      <button className="text-xs text-red-600 hover:text-red-800">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-6">
                <img src="/placeholder-uvtex.png" alt="No health conditions" className="mx-auto h-30 w-30" />
                <p className="mt-4 text-gray-500">No Health Conditions Found</p>
              </div>
              <AddHealthConditionModal healthRecordId={params.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
