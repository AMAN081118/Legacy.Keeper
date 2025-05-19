import { Suspense } from "react"
import { InsuranceHeader } from "@/components/insurance/insurance-header"
import { InsuranceTabs } from "@/components/insurance/insurance-tabs"
import { InsuranceTable } from "@/components/insurance/insurance-table"
import { getInsuranceCount } from "@/app/actions/insurance"

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? Number.parseInt(searchParams.page) : 1
  const insuranceType = typeof searchParams.type === "string" ? searchParams.type : "All"
  const searchQuery = typeof searchParams.search === "string" ? searchParams.search : ""

  const { count } = await getInsuranceCount()

  return (
    <div className="flex flex-col gap-6">
      <InsuranceHeader count={count} />
      <InsuranceTabs activeTab={insuranceType} />
      <Suspense fallback={<div>Loading...</div>}>
        <InsuranceTable currentPage={page} insuranceType={insuranceType} searchQuery={searchQuery} />
      </Suspense>
    </div>
  )
}
