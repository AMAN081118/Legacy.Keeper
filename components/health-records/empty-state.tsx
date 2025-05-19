import Image from "next/image"
import { AddMemberModal } from "./add-member-modal"

export function EmptyState() {
  return (
    <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 h-40 w-40 relative">
          <Image src="/placeholder-0exfo.png" alt="No health records" width={160} height={160} />
        </div>
        <h3 className="mb-2 text-lg font-medium">No Members Found</h3>
        <p className="mb-6 text-sm text-gray-500">
          Add family members to keep track of their health records and medical information.
        </p>
        <AddMemberModal />
      </div>
    </div>
  )
}
