import { Suspense } from "react"
import { getNominees } from "@/app/actions/nominees"
import { NomineesClient } from "@/components/nominees/nominees-client"
import { CardGridLoadingSkeleton } from "@/components/ui/loading-states"

export const dynamic = "force-dynamic"

// Separate component for data fetching
async function NomineesData() {
  try {
    const nominees = await getNominees()
    return <NomineesClient initialNominees={nominees} />
  } catch (error) {
    console.error("Error in NomineesPage:", error)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">Error loading nominees. Please try again later.</p>
      </div>
    )
  }
}

export default function NomineesPage() {
  return (
    <div className="flex flex-col space-y-6">
      <Suspense fallback={<CardGridLoadingSkeleton count={6} />}>
        <NomineesData />
      </Suspense>
    </div>
  )
}
