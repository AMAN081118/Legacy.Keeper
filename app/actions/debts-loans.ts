"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Create a new debt or loan
export async function createDebtLoan(formData: FormData) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated", success: false }
    }

    // Extract form data
    const person = formData.get("person") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const interest = formData.get("interest") ? Number.parseFloat(formData.get("interest") as string) : null
    const amountDue = formData.get("amount_due") ? Number.parseFloat(formData.get("amount_due") as string) : null
    const startDate = new Date(formData.get("start_date") as string).toISOString()
    const dueDate = formData.get("due_date") ? new Date(formData.get("due_date") as string).toISOString() : null
    const paymentMode = (formData.get("payment_mode") as string) || null
    const security = (formData.get("security") as string) || null
    const purpose = (formData.get("purpose") as string) || null
    const transactionType = formData.get("transaction_type") as string
    const status = (formData.get("status") as string) || "Active"

    // Handle file upload if present
    const file = formData.get("attachment") as File
    let attachmentUrl = null

    if (file && file.size > 0) {
      // Ensure the user's folder exists
      const folderPath = `${user.id}/`

      // Generate a unique file name
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`
      const filePath = `${folderPath}${fileName}`

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("debts_loans_documents")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { error: uploadError.message, success: false }
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("debts_loans_documents").getPublicUrl(filePath)

      attachmentUrl = urlData.publicUrl
    }

    // Create the debt/loan record
    const { data, error } = await supabase.from("debts_loans").insert([
      {
        user_id: user.id,
        person,
        amount,
        interest,
        amount_due: amountDue,
        start_date: startDate,
        due_date: dueDate,
        payment_mode: paymentMode,
        security,
        purpose,
        attachment_url: attachmentUrl,
        transaction_type: transactionType,
        status,
      },
    ])

    if (error) {
      console.error("Error creating debt/loan:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/debts-loans")
    return { success: true }
  } catch (error: any) {
    console.error("Error in createDebtLoan:", error)
    return { error: error.message, success: false }
  }
}

// Update an existing debt or loan
export async function updateDebtLoan(id: string, formData: FormData) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated", success: false }
    }

    // Extract form data
    const person = formData.get("person") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const interest = formData.get("interest") ? Number.parseFloat(formData.get("interest") as string) : null
    const amountDue = formData.get("amount_due") ? Number.parseFloat(formData.get("amount_due") as string) : null
    const startDate = new Date(formData.get("start_date") as string).toISOString()
    const dueDate = formData.get("due_date") ? new Date(formData.get("due_date") as string).toISOString() : null
    const paymentMode = (formData.get("payment_mode") as string) || null
    const security = (formData.get("security") as string) || null
    const purpose = (formData.get("purpose") as string) || null
    const transactionType = formData.get("transaction_type") as string
    const status = (formData.get("status") as string) || "Active"

    // Handle file upload if present
    const file = formData.get("attachment") as File
    let attachmentUrl = (formData.get("current_attachment") as string) || null

    if (file && file.size > 0) {
      // Ensure the user's folder exists
      const folderPath = `${user.id}/`

      // Generate a unique file name
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`
      const filePath = `${folderPath}${fileName}`

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("debts_loans_documents")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { error: uploadError.message, success: false }
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("debts_loans_documents").getPublicUrl(filePath)

      attachmentUrl = urlData.publicUrl
    }

    // Update the debt/loan record
    const { data, error } = await supabase
      .from("debts_loans")
      .update({
        person,
        amount,
        interest,
        amount_due: amountDue,
        start_date: startDate,
        due_date: dueDate,
        payment_mode: paymentMode,
        security,
        purpose,
        attachment_url: attachmentUrl,
        transaction_type: transactionType,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error updating debt/loan:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/debts-loans")
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateDebtLoan:", error)
    return { error: error.message, success: false }
  }
}

// Delete a debt or loan
export async function deleteDebtLoan(id: string) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated", success: false }
    }

    // Get the record to check for attachment
    const { data: record, error: fetchError } = await supabase
      .from("debts_loans")
      .select("attachment_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching debt/loan for deletion:", fetchError)
      return { error: fetchError.message, success: false }
    }

    // Delete the attachment if it exists
    if (record?.attachment_url) {
      const filePath = record.attachment_url.split("/").pop()
      if (filePath) {
        const { error: deleteFileError } = await supabase.storage
          .from("debts_loans_documents")
          .remove([`${user.id}/${filePath}`])

        if (deleteFileError) {
          console.error("Error deleting attachment:", deleteFileError)
          // Continue with record deletion even if file deletion fails
        }
      }
    }

    // Delete the record
    const { error } = await supabase.from("debts_loans").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting debt/loan:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/debts-loans")
    return { success: true }
  } catch (error: any) {
    console.error("Error in deleteDebtLoan:", error)
    return { error: error.message, success: false }
  }
}
