import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: session } = await supabase.auth.getSession()

    if (!session.session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.session.user.id)

    if (error) {
      console.error("Error fetching user roles:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error in debug user roles route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
