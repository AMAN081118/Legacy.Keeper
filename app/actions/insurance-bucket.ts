"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function setupInsuranceBucket() {
  try {
    const supabase = createAdminClient()
    const bucketName = "insurance"
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return { success: false, error: bucketsError.message }
    }
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Set to false if you want private
        fileSizeLimit: 10485760, // 10MB
      })
      if (createError) {
        console.error("Error creating insurance bucket:", createError)
        return { success: false, error: createError.message }
      }
    }
    return { success: true }
  } catch (error: any) {
    console.error("Error setting up insurance bucket:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
