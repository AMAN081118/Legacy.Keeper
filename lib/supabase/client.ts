"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Create a single instance of the client to be used across the app
export const createClient = () => {
  return createClientComponentClient<Database>()
}
