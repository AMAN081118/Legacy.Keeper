"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { ensureBucketExists } from "@/lib/supabase/ensure-bucket"

export async function addDocument({
  userId,
  title,
  description,
  documentType,
  file,
}: {
  userId: string
  title: string
  description: string
  documentType: string
  file: File | null
}) {
  try {
    const supabase = createServerClient()

    // Create a new document record
    const documentId = uuidv4()
    let attachmentUrl = null

    // If there's a file, upload it
    if (file) {
      // Ensure the bucket exists
      await ensureBucketExists("documents")

      // Generate a unique file path
      const fileExt = file.name.split(".").pop()
      const filePath = `${userId}/${documentId}.${fileExt}`

      // Upload the file
      const { error: uploadError, data } = await supabase.storage.from("documents").upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`)
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath)

      attachmentUrl = publicUrl
    }

    // Insert the document record
    const { error, data } = await supabase
      .from("documents")
      .insert({
        id: documentId,
        user_id: userId,
        title,
        description: description || null,
        document_type: documentType,
        attachment_url: attachmentUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error inserting document: ${error.message}`)
    }

    revalidatePath("/dashboard/documents")
    return { success: true, data }
  } catch (error) {
    console.error("Error adding document:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateDocument({
  id,
  title,
  description,
  documentType,
  file,
}: {
  id: string
  title: string
  description: string
  documentType: string
  file: File | null
}) {
  try {
    const supabase = createServerClient()

    // Get the current document to check if we need to update the file
    const { data: existingDocument, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw new Error(`Error fetching document: ${fetchError.message}`)
    }

    let attachmentUrl = existingDocument.attachment_url

    // If there's a new file, upload it
    if (file) {
      // Ensure the bucket exists
      await ensureBucketExists("documents")

      // Generate a unique file path
      const fileExt = file.name.split(".").pop()
      const filePath = `${existingDocument.user_id}/${id}.${fileExt}`

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`)
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath)

      attachmentUrl = publicUrl
    }

    // Update the document record
    const { error, data } = await supabase
      .from("documents")
      .update({
        title,
        description: description || null,
        document_type: documentType,
        attachment_url: attachmentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating document: ${error.message}`)
    }

    revalidatePath("/dashboard/documents")
    return { success: true, data }
  } catch (error) {
    console.error("Error updating document:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteDocument({ id }: { id: string }) {
  try {
    const supabase = createServerClient()

    // Get the document to get the file path
    const { data: document, error: fetchError } = await supabase.from("documents").select("*").eq("id", id).single()

    if (fetchError) {
      throw new Error(`Error fetching document: ${fetchError.message}`)
    }

    // If there's an attachment, delete it
    if (document.attachment_url) {
      const filePath = document.attachment_url.split("/").pop()
      const { error: deleteFileError } = await supabase.storage
        .from("documents")
        .remove([`${document.user_id}/${filePath}`])

      if (deleteFileError) {
        console.error(`Error deleting file: ${deleteFileError.message}`)
        // Continue with deletion even if file removal fails
      }
    }

    // Delete the document record
    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) {
      throw new Error(`Error deleting document: ${error.message}`)
    }

    revalidatePath("/dashboard/documents")
    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, error: (error as Error).message }
  }
}
