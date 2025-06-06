"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function setupStorage() {
  try {
    const supabase = createAdminClient()

    // Create the user_documents bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return { success: false, error: bucketsError.message }
    }

    const bucketName = "user_documents"
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      console.log("Creating bucket:", bucketName)
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return { success: false, error: createError.message }
      }

      // Try to set bucket policies to allow public access
      try {
        await supabase.rpc('create_policy', {
          policy_name: 'Users can access their own files',
          table_name: 'storage.objects',
          operation: 'SELECT',
          using_expression: `bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]`
        })
      } catch (policyError) {
        console.error("Error setting bucket policy:", policyError)
        // Continue even if policy setting fails
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error setting up storage:", error)
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
