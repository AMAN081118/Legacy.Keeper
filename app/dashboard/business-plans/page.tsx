import { getBusinessPlans } from "@/app/actions/business-plans"
import { BusinessPlansHeader } from "@/components/business-plans/business-plans-header"
import { BusinessPlansTable } from "@/components/business-plans/business-plans-table"
import { setupStorage } from "@/app/actions/storage"

export default async function BusinessPlansPage() {
  // Ensure storage bucket exists
  await setupStorage()

  // Fetch business plans
  const { data: businessPlans, error } = await getBusinessPlans()

  return (
    <div className="flex flex-col gap-6 p-6">
      <BusinessPlansHeader />
      <BusinessPlansTable businessPlans={businessPlans || []} error={error} />
    </div>
  )
}
