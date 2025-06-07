"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { DepositInvestment } from "@/lib/supabase/database.types"

export async function getDepositsInvestments(userId: string) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("deposits_investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching deposits and investments:", error)
    return { success: false, error: "Failed to fetch deposits and investments" }
  }
}

export async function getDepositsInvestmentsStats() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("deposits_investments")
      .select("amount")
      .not("amount", "is", null)

    if (error) throw error

    const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0)
    return { success: true, data: { totalAmount, count: data.length } }
  } catch (error) {
    console.error("Error fetching deposits and investments stats:", error)
    return { success: false, error: "Failed to fetch stats" }
  }
}

export async function addDepositInvestment(formData: FormData) {
  try {
    const supabase = createServerClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.session.user.id

    const name = formData.get("name") as string
    const rawAmount = Number.parseFloat(formData.get("amount") as string)
    // Convert amount to thousands to fit within database precision
    const amount = rawAmount / 1000
    const investmentType = formData.get("investmentType") as DepositInvestment["investment_type"]
    const description = formData.get("description") as string
    const paidTo = formData.get("paidTo") as string
    const date = formData.get("date") as string
    const maturityDate = (formData.get("maturityDate") as string) || null
    const interestRate = formData.get("interestRate") ? Number.parseFloat(formData.get("interestRate") as string) : null
    const expectedReturns = formData.get("expectedReturns")
      ? Number.parseFloat(formData.get("expectedReturns") as string) / 1000 // Convert expected returns to thousands too
      : null
    const status = (formData.get("status") as DepositInvestment["status"]) || "Active"
    let attachmentUrl: string | null = null

    // Handle attachment if present
    const attachmentFile = formData.get("attachment") as File

    if (attachmentFile && attachmentFile.size > 0) {
      const fileExt = attachmentFile.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("deposits-investments")
        .upload(fileName, attachmentFile)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { success: false, error: uploadError.message }
      }

      const { data: urlData } = await supabase.storage.from("deposits-investments").getPublicUrl(fileName)
      attachmentUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from("deposits_investments")
      .insert({
        user_id: userId,
        name,
        amount,
        investment_type: investmentType,
        description,
        paid_to: paidTo,
        date,
        maturity_date: maturityDate,
        interest_rate: interestRate,
        expected_returns: expectedReturns,
        attachment_url: attachmentUrl,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding deposit/investment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/deposits-investments")
    return { success: true, data }
  } catch (error: any) {
    console.error("Error adding deposit/investment:", error)
    return { success: false, error: error.message }
  }
}

export async function updateDepositInvestment(id: string, formData: FormData) {
  try {
    const supabase = createServerClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.session.user.id

    // First check if the record belongs to the user
    const { data: existingData, error: existingError } = await supabase
      .from("deposits_investments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (existingError || !existingData) {
      console.error("Error fetching existing deposit/investment:", existingError)
      return { success: false, error: "Record not found or not authorized" }
    }

    const name = formData.get("name") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const investmentType = formData.get("investmentType") as DepositInvestment["investment_type"]
    const description = formData.get("description") as string
    const paidTo = formData.get("paidTo") as string
    const date = formData.get("date") as string
    const maturityDate = (formData.get("maturityDate") as string) || null
    const interestRate = formData.get("interestRate") ? Number.parseFloat(formData.get("interestRate") as string) : null
    const expectedReturns = formData.get("expectedReturns")
      ? Number.parseFloat(formData.get("expectedReturns") as string)
      : null
    const status = formData.get("status") as DepositInvestment["status"]

    // Handle attachment if present
    let attachmentUrl = existingData.attachment_url
    const attachmentFile = formData.get("attachment") as File

    if (attachmentFile && attachmentFile.size > 0) {
      const fileExt = attachmentFile.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("deposits-investments")
        .upload(fileName, attachmentFile)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { success: false, error: uploadError.message }
      }

      const { data: urlData } = await supabase.storage.from("deposits-investments").getPublicUrl(fileName)

      attachmentUrl = urlData.publicUrl
    } else if (formData.get("removeAttachment")) {
      // If removeAttachment is present, delete the file from storage and clear attachment_url
      if (existingData.attachment_url) {
        // Extract the file path relative to the bucket
        // Example: https://<project>.supabase.co/storage/v1/object/public/deposits-investments/userid/filename.pdf
        const urlParts = existingData.attachment_url.split("/deposits-investments/");
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          const { error: deleteError } = await supabase.storage
            .from("deposits-investments")
            .remove([filePath]);
          if (deleteError) {
            console.error("Error deleting file:", deleteError)
            // Continue even if file deletion fails
          }
        }
      }
      attachmentUrl = null;
    }

    const { data, error } = await supabase
      .from("deposits_investments")
      .update({
        name,
        amount,
        investment_type: investmentType,
        description,
        paid_to: paidTo,
        date,
        maturity_date: maturityDate,
        interest_rate: interestRate,
        expected_returns: expectedReturns,
        attachment_url: attachmentUrl,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating deposit/investment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/deposits-investments")
    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating deposit/investment:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteDepositInvestment(id: string) {
  try {
    const supabase = createServerClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.session.user.id

    // First check if the record belongs to the user
    const { data: existingData, error: existingError } = await supabase
      .from("deposits_investments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (existingError || !existingData) {
      console.error("Error fetching existing deposit/investment:", existingError)
      return { success: false, error: "Record not found or not authorized" }
    }

    const { error } = await supabase.from("deposits_investments").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("Error deleting deposit/investment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/deposits-investments")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting deposit/investment:", error)
    return { success: false, error: error.message }
  }
}

export async function getDepositInvestmentById(id: string) {
  try {
    const supabase = createServerClient()

    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.session.user.id

    const { data, error } = await supabase
      .from("deposits_investments")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching deposit/investment:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error fetching deposit/investment:", error)
    return { success: false, error: error.message }
  }
}
