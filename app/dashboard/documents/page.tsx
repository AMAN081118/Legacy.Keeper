import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DocumentsClient } from "@/components/documents/documents-client"
import { TableLoadingSkeleton } from "@/components/ui/loading-states"

// Separate component for data fetching
async function DocumentsData({ userId }: { userId: string }) {
  const supabase = createServerClient()

  // Get documents data
  const { data: documentsData } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return <DocumentsClient initialDocuments={documentsData || []} userId={userId} />
}

export default async function DocumentsPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <Suspense fallback={<TableLoadingSkeleton rows={5} columns={4} />}>
      <DocumentsData userId={session.user.id} />
    </Suspense>
  )
}
