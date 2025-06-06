import { Suspense } from "react"
import { InsuranceHeader } from "@/components/insurance/insurance-header"
import { InsuranceTabs } from "@/components/insurance/insurance-tabs"
import { InsuranceTable } from "@/components/insurance/insurance-table"
import { getInsuranceCount } from "@/app/actions/insurance"
import { cookies } from "next/headers"
import { getCurrentRoleFromSession } from "@/app/actions/user-roles"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

interface PageProps {
  params: Promise<{ [key: string]: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const cookieStore = await cookies()
  const supabase = createServerClient()
  let currentRole = null
  let userId = null
  let session = null
  try {
    currentRole = await getCurrentRoleFromSession()
    const sessionResult = await supabase.auth.getSession()
    session = sessionResult.data.session
    if (session) {
      userId = session.user.id
    }
  } catch (error) {
    console.error("Error getting current role:", error)
  }

  // --- GUARD: Only allow access if user is not nominee, or nominee with 'Family' access ---
  if (
    currentRole?.name === "nominee" &&
    (!currentRole.accessCategories || !currentRole.accessCategories.includes("Family"))
  ) {
    redirect("/dashboard")
  }
  // -----------------------------------------------------------------------------

  // If nominee, get related user's id by email
  if (currentRole?.name === "nominee" && currentRole.relatedUser?.email) {
    const { data: relatedUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", currentRole.relatedUser.email)
      .single()
    if (relatedUser?.id) userId = relatedUser.id
  }

  // Await searchParams before using its properties (Next.js 14+)
  const params = await searchParams
  const page = typeof params.page === "string" ? Number(params.page) : 1
  const insuranceType = typeof params.type === "string" ? params.type : "All"
  const searchQuery = typeof params.search === "string" ? params.search : ""

  const { count } = await getInsuranceCount()

  return (
    <div className="flex flex-col gap-6">
      <InsuranceHeader count={count} />
      <InsuranceTabs activeTab={insuranceType} />
      <Suspense fallback={<div>Loading...</div>}>
        <InsuranceTable currentPage={page} insuranceType={insuranceType} searchQuery={searchQuery} userId={userId} />
      </Suspense>
    </div>
  )
}
