"use client"

import { createClient } from "./client"

export async function setupStorage() {
  try {
    const supabase = createClient()

    // Check if the user_documents bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      return
    }

    // If the bucket doesn't exist and the user has permission, create it
    const userDocumentsBucketExists = buckets?.some((bucket) => bucket.name === "user_documents")

    if (!userDocumentsBucketExists) {
      try {
        const { data, error } = await supabase.storage.createBucket("user_documents", {
          public: false,
          fileSizeLimit: 5242880, // 5MB
        })

        if (error) {
          console.error("Error creating user_documents bucket:", error)
        } else {
          console.log("Created user_documents bucket")
        }
      } catch (err) {
        console.error("Error creating bucket:", err)
      }
    }
  } catch (error) {
    console.error("Error setting up storage:", error)
  }
}
