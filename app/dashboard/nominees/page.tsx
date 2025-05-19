import { getNominees } from "@/app/actions/nominees"
import { NomineesClient } from "@/components/nominees/nominees-client"

export const dynamic = "force-dynamic"

export default async function NomineesPage() {
  try {
    const nominees = await getNominees()

    return (
      <div className="flex flex-col space-y-6">
        <NomineesClient initialNominees={nominees} />
      </div>
    )
  } catch (error) {
    console.error("Error in NomineesPage:", error)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">Error loading nominees. Please try again later.</p>
      </div>
    )
  }
}
