import { getFamilyMember, getFamilyDocuments } from "@/app/actions/family-vaults"
import { FamilyMemberDetailClient } from "@/components/family-vaults/family-member-detail-client"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  await searchParams // We need to await this even if we don't use it

  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { success: memberSuccess, data: member, error: memberError } = await getFamilyMember(id)

  if (!memberSuccess || !member) {
    console.error("Error fetching family member:", memberError)
    notFound()
  }

  const { success: docsSuccess, data: documents, error: docsError } = await getFamilyDocuments(id)

  if (!docsSuccess) {
    console.error("Error fetching family documents:", docsError)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <FamilyMemberDetailClient member={member} documents={documents || []} />
    </div>
  )
}
