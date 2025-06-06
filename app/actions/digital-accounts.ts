"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

// Function to ensure the digital-accounts bucket exists
async function ensureDigitalAccountsBucket() {
  const supabase = createServerActionClient({ cookies })

  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketName = "digital-accounts"
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      })
    }

    return bucketName
  } catch (error) {
    console.error("Error ensuring digital accounts bucket:", error)
    throw error
  }
}

// Helper function to handle Supabase requests with retry logic
async function safeSupabaseRequest<T>(requestFn: () => Promise<{ data: any; error: any }>, maxRetries = 3): Promise<{ data: any; error: any }> {
  let lastError: any = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn()
      return response
    } catch (error) {
      lastError = error
      if (attempt === maxRetries) {
        throw error
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  throw lastError
}

// Get all digital accounts for a user
export async function getDigitalAccounts(userId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest<{ data: any[] | null; error: any }>(async () => {
      const response = await supabase
        .from("digital_accounts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
      return response
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Error fetching digital accounts:", error)
    return {
      success: false,
      error: "An error occurred while fetching accounts. Please try again later.",
    }
  }
}

// Get a single digital account by ID
export async function getDigitalAccount(id: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest<{ data: any | null; error: any }>(async () => {
      const response = await supabase
        .from("digital_accounts")
        .select("*")
        .eq("id", id)
        .single()
      return response
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching digital account:", error)
    return {
      success: false,
      error: "An error occurred while fetching the account. Please try again.",
    }
  }
}

// Add a new digital account
export async function addDigitalAccount(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest<{ data: any | null; error: any }>(async () => {
      const response = await supabase
        .from("digital_accounts")
        .insert({
          user_id: formData.get("user_id") as string,
          platform: formData.get("platform") as string,
          username: formData.get("username") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          recovery_email: formData.get("recovery_email") as string,
          recovery_phone: formData.get("recovery_phone") as string,
          two_factor_enabled: formData.get("two_factor_enabled") === "true",
          notes: formData.get("notes") as string,
          date: new Date().toISOString(),
        })
        .select()
        .single()
      return response
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error adding digital account:", error)
    return {
      success: false,
      error: "An error occurred while adding the account. Please try again.",
    }
  }
}

// Update an existing digital account
export async function updateDigitalAccount(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest<{ data: any | null; error: any }>(async () => {
      const response = await supabase
        .from("digital_accounts")
        .update({
          platform: formData.get("platform") as string,
          username: formData.get("username") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          recovery_email: formData.get("recovery_email") as string,
          recovery_phone: formData.get("recovery_phone") as string,
          two_factor_enabled: formData.get("two_factor_enabled") === "true",
          notes: formData.get("notes") as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formData.get("id") as string)
        .select()
        .single()
      return response
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating digital account:", error)
    return {
      success: false,
      error: "An error occurred while updating the account. Please try again.",
    }
  }
}

// Delete a digital account
export async function deleteDigitalAccount(id: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { error: deleteError } = await safeSupabaseRequest(async () => {
      const response = await supabase
        .from("digital_accounts")
        .delete()
        .eq("id", id)
      return response
    })

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting digital account:", error)
    return {
      success: false,
      error: "An error occurred while deleting the account. Please try again.",
    }
  }
}
