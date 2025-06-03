import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { AddInsuranceModal } from "./add-insurance-modal"

export function InsuranceHeader({ count }: { count: number }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insurance</h1>
          <p className="text-muted-foreground">View Insurance Details here!!</p>
        </div>
        <AddInsuranceModal>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add New Insurance
          </Button>
        </AddInsuranceModal>
      </div>
      <h2 className="text-xl font-semibold">Insurance ({count})</h2>
    </div>
  )
}
