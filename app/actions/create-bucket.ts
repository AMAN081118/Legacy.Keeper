"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function createDebtsLoansBucket() {
  try {
    const adminClient = createAdminClient()

    // Check if the bucket already exists
    const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      return { success: false, error: bucketsError.message }
    }

    // If the bucket already exists, return success
    if (buckets?.some((bucket) => bucket.name === "debts-loans-documents")) {
      return { success: true, message: "Bucket already exists" }
    }

    // Create the bucket
    const { data, error } = await adminClient.storage.createBucket("debts-loans-documents", {
      public: true,
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return { success: false, error: error.message }
    }

    // Set up RLS policies for the bucket
    // await setupBucketPolicies(adminClient)

    return { success: true, message: "Bucket created successfully" }
  } catch (error: any) {
    console.error("Error creating bucket:", error)
    return { success: false, error: error.message }
  }
}

// async function setupBucketPolicies(adminClient: any) {
//   try {
//     // Create policy for users to select their own files
//     await adminClient.query(`
//       CREATE POLICY IF NOT EXISTS "Users can view their own files"
//       ON storage.objects
//       FOR SELECT
//       USING (bucket_id = 'debts-loans-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
//     `)

//     // Create policy for users to insert their own files
//     await adminClient.query(`
//       CREATE POLICY IF NOT EXISTS "Users can upload their own files"
//       ON storage.objects
//       FOR INSERT
//       WITH CHECK (bucket_id = 'debts-loans-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
//     `)

//     // Create policy for users to update their own files
//     await adminClient.query(`
//       CREATE POLICY IF NOT EXISTS "Users can update their own files"
//       ON storage.objects
//       FOR UPDATE
//       USING (bucket_id = 'debts-loans-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
//     `)

//     // Create policy for users to delete their own files
//     await adminClient.query(`
//       CREATE POLICY IF NOT EXISTS "Users can delete their own files"
//       ON storage.objects
//       FOR DELETE
//       USING (bucket_id = 'debts-loans-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
//     `)

//     return { success: true }
//   } catch (error: any) {
//     console.error("Error setting up bucket policies:", error)
//     return { success: false, error: error.message }
//   }
// }
