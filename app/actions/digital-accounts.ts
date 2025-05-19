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
async function safeSupabaseRequest<T>(requestFn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any = null
  let retryCount = 0

  while (retryCount < maxRetries) {
    try {
      // Add exponential backoff delay
      if (retryCount > 0) {
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      return await requestFn()
    } catch (error: any) {
      lastError = error

      // Check if it's a rate limiting error
      const isRateLimitError =
        error.message?.includes("Too Many Requests") ||
        error.message?.includes("429") ||
        error.message?.includes("Unexpected token")

      if (isRateLimitError && retryCount < maxRetries - 1) {
        retryCount++
        console.log(`Rate limit hit, retrying (${retryCount}/${maxRetries})...`)
        continue
      }

      throw error
    }
  }

  throw lastError
}

// Get all digital accounts for a user
export async function getDigitalAccounts(userId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest(() =>
      supabase.from("digital_accounts").select("*").eq("user_id", userId).order("date", { ascending: false }),
    )

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
    const { data, error } = await safeSupabaseRequest(() =>
      supabase.from("digital_accounts").select("*").eq("id", id).single(),
    )

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
export async function addDigitalAccount({
  userId,
  accountName,
  accountIdNo,
  passwordPhone,
  loginContact,
  description,
  governmentIdUrl,
  date,
}: {
  userId: string
  accountName: string
  accountIdNo?: string
  passwordPhone?: string
  loginContact?: string
  description?: string
  governmentIdUrl?: string | null
  date: string
}) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest(() =>
      supabase
        .from("digital_accounts")
        .insert({
          id: uuidv4(),
          user_id: userId,
          account_name: accountName,
          account_id_no: accountIdNo,
          password_phone: passwordPhone,
          login_contact: loginContact,
          description,
          government_id_url: governmentIdUrl,
          date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(),
    )

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/digital-accounts")
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
export async function updateDigitalAccount({
  id,
  userId,
  accountName,
  accountIdNo,
  passwordPhone,
  loginContact,
  description,
  governmentIdUrl,
  date,
}: {
  id: string
  userId: string
  accountName: string
  accountIdNo?: string
  passwordPhone?: string
  loginContact?: string
  description?: string
  governmentIdUrl?: string | null
  date: string
}) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data, error } = await safeSupabaseRequest(() =>
      supabase
        .from("digital_accounts")
        .update({
          account_name: accountName,
          account_id_no: accountIdNo,
          password_phone: passwordPhone,
          login_contact: loginContact,
          description,
          government_id_url: governmentIdUrl,
          date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select(),
    )

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/digital-accounts")
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
    // First, get the account to check if it has an attachment
    const { data: account, error: fetchError } = await safeSupabaseRequest(() =>
      supabase.from("digital_accounts").select("government_id_url").eq("id", id).single(),
    )

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // If there's an attachment, delete it from storage
    if (account?.government_id_url) {
      try {
        const bucketName = await ensureDigitalAccountsBucket()
        const filePath = account.government_id_url.split(`${bucketName}/`)[1]

        if (filePath) {
          await safeSupabaseRequest(() => supabase.storage.from(bucketName).remove([filePath]))
        }
      } catch (storageError) {
        console.error("Error with storage operation:", storageError)
        // Continue with account deletion even if file deletion fails
      }
    }

    // Delete the account record
    const { error: deleteError } = await safeSupabaseRequest(() =>
      supabase.from("digital_accounts").delete().eq("id", id),
    )

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    revalidatePath("/dashboard/digital-accounts")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting digital account:", error)
    return {
      success: false,
      error: "An error occurred while deleting the account. Please try again.",
    }
  }
}
