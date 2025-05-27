"use client"

import { createClient } from "./client"
import { setupStorage } from "@/app/actions/storage"
import { setupInsuranceBucket } from "@/app/actions/insurance-bucket"

export async function ensureBucketExists(bucketName = "user_documents"): Promise<boolean> {
  if (!bucketName) {
    console.error("Bucket name is required")
    return false
  }

  try {
    const supabase = createClient()

    // First, check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      // If we can't check buckets, try the server-side approach
    } else if (buckets?.some((bucket) => bucket.name === bucketName)) {
      // Bucket already exists
      return true
    }

    // If we're here, either we couldn't check buckets or the bucket doesn't exist
    // Use the server action to create the bucket with admin privileges
    if (bucketName === "insurance") {
      const result = await setupInsuranceBucket()
      if (!result.success) {
        console.error("Server error creating insurance bucket:", result.error)
        return false
      }
      return true
    } else {
      const result = await setupStorage()
      if (!result.success) {
        console.error("Server error creating bucket:", result.error)
        return false
      }
      return true
    }
  } catch (error) {
    console.error(`Error ensuring ${bucketName} bucket exists:`, error)
    return false
  }
}
