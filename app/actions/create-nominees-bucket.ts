"use server"

import { createClient } from "@supabase/supabase-js"

export async function createNomineesBucket() {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "nominees")

    if (!bucketExists) {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket("nominees", {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      })

      if (error) {
        console.error("Error creating nominees bucket:", error)
        return { success: false, error: error.message }
      }

      console.log("Nominees bucket created successfully:", data)
    } else {
      console.log("Nominees bucket already exists")
    }

    return { success: true }
  } catch (error) {
    console.error("Error in createNomineesBucket:", error)
    return { success: false, error: String(error) }
  }
}
