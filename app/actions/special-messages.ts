"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ensureSpecialMessageBucket } from "./create-special-message-bucket"

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

  // Fetch all users for recipient mapping
  const { data: allUsers, error: usersError } = await supabase.from("users").select("id, name, email")
  if (usersError) {
    console.error("Error fetching users:", usersError)
    return messages // Return messages without user details
  }

  // If we have messages, fetch the sender details for each message
  if (messages && messages.length > 0) {
    // Get unique sender IDs
    const senderIds = [...new Set(messages.map((message) => message.sender_id))]

    // Fetch user details for all senders
    const { data: senders, error: sendersError } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", senderIds)

    if (sendersError) {
      console.error("Error fetching senders:", sendersError)
      return messages // Return messages without user details
    }

    // Create a map of user IDs to user details
    const senderMap: Record<string, any> = senders.reduce((acc: Record<string, any>, user: any) => {
      acc[user.id] = user
      return acc
    }, {})

    // Attach sender and recipient details to each message
    const messagesWithUsers = messages.map((message: any) => {
      let recipients = []
      if (message.is_for_all) {
        recipients = allUsers
      } else if (Array.isArray(message.recipient_ids)) {
        recipients = allUsers.filter((u: any) => message.recipient_ids.includes(u.id))
      }
      return {
      ...message,
        sender: senderMap[message.sender_id] || null,
        recipients,
      }
    })

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
    const bucketExists = await ensureSpecialMessageBucket();
    if (!bucketExists) {
      return { success: false, error: "Storage bucket not available" }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `special_messages/${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("special-message-document")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: "Failed to upload file" }
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from("special-message-document").getPublicUrl(fileName)

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
        .from("special-message-document")
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

export async function updateSpecialMessage(id: string, formData: FormData) {
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
  const currentAttachmentUrl = formData.get("currentAttachmentUrl") as string | null

  let attachmentUrl = currentAttachmentUrl || null

  // Handle file upload if present
  if (file && file.size > 0) {
    // Ensure bucket exists
    const bucketExists = await ensureSpecialMessageBucket();
    if (!bucketExists) {
      return { success: false, error: "Storage bucket not available" }
    }

    // Delete old attachment if it exists
    if (currentAttachmentUrl) {
      const filePath = currentAttachmentUrl.split("/").slice(-2).join("/")
      if (filePath) {
        await supabase.storage.from("special-message-document").remove([`special_messages/${filePath}`])
      }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `special_messages/${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("special-message-document")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: "Failed to upload file" }
    }

    // Get public URL
    const { data: urlData } = await supabase.storage.from("special-message-document").getPublicUrl(fileName)
    attachmentUrl = urlData.publicUrl
  }

  // Update message
  const { data, error } = await supabase
    .from("special_messages")
    .update({
      message,
      recipient_ids: isForAll ? [] : recipientIds,
      attachment_url: attachmentUrl,
      is_for_all: isForAll,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("sender_id", user.id)
    .select()

  if (error) {
    console.error("Error updating special message:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/special-message")
  return { success: true, data }
}
