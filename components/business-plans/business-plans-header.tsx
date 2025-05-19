import { AddBusinessPlanModal } from "./add-business-plan-modal"

export function BusinessPlansHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Plans</h1>
          <p className="text-muted-foreground">View Business Plan Details here!</p>
        </div>
        <AddBusinessPlanModal />
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Business Succession and Plannings</h2>
      </div>
    </div>
  )
}
