import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DocumentsClient } from "@/components/documents/documents-client"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export default async function DocumentsPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Ensure the documents bucket exists
  await ensureBucketExists("documents")

  // Get documents data
  const { data: documentsData } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return <DocumentsClient initialDocuments={documentsData || []} userId={session.user.id} />
}
