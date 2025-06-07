import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export const dynamic = 'force-dynamic'

export const createServerClient = (cookieStore?: ReturnType<typeof cookies>) => {
  // Use cookies as a function, not as a value
  return createServerComponentClient<Database>({ cookies: () => cookieStore || cookies() }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
}
