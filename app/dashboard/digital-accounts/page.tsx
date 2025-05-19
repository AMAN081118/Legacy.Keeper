import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DigitalAccountsClient } from "@/components/digital-accounts/digital-accounts-client"

export const metadata: Metadata = {
  title: "Digital Accounts | Legacy Keeper",
  description: "Manage your digital accounts and passwords securely.",
}

export default async function DigitalAccountsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <DigitalAccountsClient userId={session.user.id} />
    </div>
  )
}
