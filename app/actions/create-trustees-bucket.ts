"use server"

import { createClient } from "@supabase/supabase-js"

export async function createTrusteesBucket() {
  try {
    // Create a Supabase client with service role key for admin privileges
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "trustees")

    // Create bucket if it doesn't exist
    if (!bucketExists) {
      const { data, error } = await supabaseAdmin.storage.createBucket("trustees", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) {
        console.error("Error creating trustees bucket:", error)
        return { success: false, error: error.message }
      }
    }

    // Set bucket policy to public
    const { error: policyError } = await supabaseAdmin.storage.updateBucket("trustees", {
      public: true,
    })

    if (policyError) {
      console.error("Error updating bucket policy:", policyError)
      return { success: false, error: policyError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in createTrusteesBucket:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
