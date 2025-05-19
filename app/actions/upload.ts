"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function uploadFile(
  bucketName: string,
  filePath: string,
  fileContent: ArrayBuffer,
  contentType: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!bucketName || !filePath) {
      return { success: false, error: "Missing bucket name or file path" }
    }

    const supabase = createAdminClient()

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      return { success: false, error: bucketsError.message }
    }

    if (!buckets.some((bucket) => bucket.name === bucketName)) {
      console.error(`Bucket "${bucketName}" not found`)
      return { success: false, error: "Bucket not found" }
    }

    // Upload the file using admin privileges
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, fileContent, {
      contentType,
      upsert: true,
    })

    if (error) {
      console.error("Server upload error:", error)
      return { success: false, error: error.message }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    // Revalidate all paths that might display this file
    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard/insurance")
    revalidatePath("/dashboard/business-plans")
    revalidatePath("/dashboard/health-records")

    return { success: true, url: publicUrl }
  } catch (error: any) {
    console.error("Server upload error:", error)
    return { success: false, error: error.message || "Unknown error occurred during upload" }
  }
}

// Update user's government ID URL
export async function updateUserGovernmentId(
  userId: string,
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("users").update({ government_id_url: url }).eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}

// Update transaction attachment URL
export async function updateTransactionAttachment(
  transactionId: string | undefined,
  url: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!transactionId) return { success: false, error: "Transaction ID is required" }

    const supabase = createAdminClient()

    const { error } = await supabase.from("transactions").update({ attachment_url: url }).eq("id", transactionId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Unknown error occurred" }
  }
}
