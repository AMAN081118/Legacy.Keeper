"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export async function getSpecialMessages() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  // First, fetch the messages
  const { data: messages, error } = await supabase
    .from("special_messages")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching special messages:", error)
    return { error: error.message, data: null }
  }

  // If we have messages, fetch the sender details for each message
  if (messages && messages.length > 0) {
    // Get unique sender IDs
    const senderIds = [...new Set(messages.map((message) => message.sender_id))]

    // Fetch user details for all senders
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", senderIds)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return messages // Return messages without user details
    }

    // Create a map of user IDs to user details
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {})

    // Attach user details to each message
    const messagesWithUsers = messages.map((message) => ({
      ...message,
      sender: userMap[message.sender_id] || null,
    }))

    return messagesWithUsers
  }

  return messages || []
}

export async function getUsers() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase.from("users").select("id, email, name").neq("id", user.id) // Exclude current user

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data || []
}

export async function createSpecialMessage(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const message = formData.get("message") as string
  const isForAll = formData.get("isForAll") === "true"
  const recipientIdsJson = formData.get("recipientIds") as string
  const recipientIds = JSON.parse(recipientIdsJson || "[]")
  const file = formData.get("file") as File | null

  let attachmentUrl = null

  // Handle file upload if present
  if (file && file.size > 0) {
    // Ensure bucket exists
    const bucketExists = await ensureBucketExists("user_documents")
    if (!bucketExists) {
      return { success: false, error: "Storage bucket not available" }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `special_messages/${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user_documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: "Failed to upload file" }
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from("user_documents").getPublicUrl(fileName)

    attachmentUrl = urlData.publicUrl
  }

  // Insert message
  const { data, error } = await supabase
    .from("special_messages")
    .insert({
      sender_id: user.id,
      recipient_ids: isForAll ? [] : recipientIds,
      message,
      attachment_url: attachmentUrl,
      is_for_all: isForAll,
    })
    .select()

  if (error) {
    console.error("Error creating special message:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/special-message")
  return { success: true, data }
}

export async function deleteSpecialMessage(id: string) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // First, get the message to check if there's an attachment to delete
  const { data: message, error: fetchError } = await supabase
    .from("special_messages")
    .select("attachment_url")
    .eq("id", id)
    .eq("sender_id", user.id)
    .single()

  if (fetchError) {
    console.error("Error fetching message:", fetchError)
    return { success: false, error: fetchError.message }
  }

  // Delete attachment if exists
  if (message?.attachment_url) {
    const filePath = message.attachment_url.split("/").slice(-2).join("/")
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("user_documents")
        .remove([`special_messages/${filePath}`])

      if (storageError) {
        console.error("Error deleting file:", storageError)
        // Continue with message deletion even if file deletion fails
      }
    }
  }

  // Delete message
  const { error } = await supabase.from("special_messages").delete().eq("id", id).eq("sender_id", user.id)

  if (error) {
    console.error("Error deleting special message:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/special-message")
  return { success: true }
}
