"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// Function to ensure the reminders-attachments bucket exists
async function ensureRemindersBucket() {
  const supabase = createServerClient()

  const { data: buckets } = await supabase.storage.listBuckets()

  if (!buckets?.find((bucket) => bucket.name === "reminders-attachments")) {
    await supabase.storage.createBucket("reminders-attachments", {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    })
  }

  return "reminders-attachments"
}

export async function getReminders() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Not authenticated", reminders: [] }
    }

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching reminders:", error)
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        reminders: [] 
      }
    }

    return { reminders, error: null }
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      reminders: [] 
    }
  }
}

export async function addReminder(formData: FormData) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    const reminderName = formData.get("reminderName") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const frequency = Number.parseInt(formData.get("frequency") as string) || null
    const notes = formData.get("notes") as string
    const file = formData.get("file") as File

    let attachmentUrl = null

    if (file && file.size > 0) {
      try {
        const bucketName = await ensureRemindersBucket()
        const fileExt = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${session.user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file)

        if (uploadError) {
          console.error("Error uploading file:", uploadError)
          return { error: uploadError.message, success: false }
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(filePath)

        attachmentUrl = publicUrl
      } catch (error) {
        console.error("Error processing file:", error)
        return { error: "Error processing file", success: false }
      }
    }

    const { error } = await supabase.from("reminders").insert({
      user_id: session.user.id,
      reminder_name: reminderName,
      category,
      start_date: startDate,
      frequency,
      notes,
      attachment_url: attachmentUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding reminder:", error)
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        success: false 
      }
    }

    revalidatePath("/dashboard/reminders")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error creating reminder:", error)
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      success: false 
    }
  }
}

export async function updateReminder(formData: FormData) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    const id = formData.get("id") as string
    const reminderName = formData.get("reminderName") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const frequency = Number.parseInt(formData.get("frequency") as string) || null
    const notes = formData.get("notes") as string
    const file = formData.get("file") as File
    const currentAttachmentUrl = formData.get("currentAttachmentUrl") as string

    let attachmentUrl = currentAttachmentUrl

    if (file && file.size > 0) {
      try {
        const bucketName = await ensureRemindersBucket()
        const fileExt = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${session.user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file)

        if (uploadError) {
          console.error("Error uploading file:", uploadError)
          return { error: uploadError.message, success: false }
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(filePath)

        attachmentUrl = publicUrl
      } catch (error) {
        console.error("Error processing file:", error)
        return { error: "Error processing file", success: false }
      }
    }

    const { error } = await supabase
      .from("reminders")
      .update({
        reminder_name: reminderName,
        category,
        start_date: startDate,
        frequency,
        notes,
        attachment_url: attachmentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) {
      console.error("Error updating reminder:", error)
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        success: false 
      }
    }

    revalidatePath("/dashboard/reminders")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating reminder:", error)
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      success: false 
    }
  }
}

export async function deleteReminder(id: string) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Not authenticated", success: false }
    }

    const { error } = await supabase.from("reminders").delete().eq("id", id).eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting reminder:", error)
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        success: false 
      }
    }

    revalidatePath("/dashboard/reminders")
    revalidatePath("/dashboard")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      success: false 
    }
  }
}
