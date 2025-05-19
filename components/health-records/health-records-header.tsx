import { AddMemberModal } from "./add-member-modal"

interface HealthRecordsHeaderProps {
  recordCount: number
}

export function HealthRecordsHeader({ recordCount }: HealthRecordsHeaderProps) {
  return (
    <div className="border-b bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Health Records</h1>
          <p className="mt-1 text-sm text-gray-500">View Health Records here!</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium">Health Records ({recordCount})</h2>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <AddMemberModal />
        </div>
      </div>
    </div>
  )
}
