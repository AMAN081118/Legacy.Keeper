"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { DepositInvestment } from "@/lib/supabase/database.types"

export async function getDepositsInvestments() {
  const cookieStore = cookies()
  const supabase = createServerClient()

  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id

  const { data, error } = await supabase
    .from("deposits_investments")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching deposits and investments:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getDepositsInvestmentsStats() {
  const cookieStore = cookies()
  const supabase = createServerClient()

  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id

  // Get total amount invested
  const { data: totalData, error: totalError } = await supabase
    .from("deposits_investments")
    .select("amount")
    .eq("user_id", userId)

  if (totalError) {
    console.error("Error fetching total amount:", totalError)
    return { success: false, error: totalError.message }
  }

  const totalAmount = totalData.reduce((sum, item) => sum + Number(item.amount), 0)

  // Get count of investments
  const { count, error: countError } = await supabase
    .from("deposits_investments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (countError) {
    console.error("Error fetching count:", countError)
    return { success: false, error: countError.message }
  }

  return {
    success: true,
    data: {
      totalAmount,
      count: count || 0,
    },
  }
}

export async function addDepositInvestment(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient()

  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id

  try {
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
    const status = (formData.get("status") as DepositInvestment["status"]) || "Active"

    // Handle attachment if present
    let attachmentUrl = null
    const attachmentFile = formData.get("attachment") as File

    if (attachmentFile && attachmentFile.size > 0) {
      const fileExt = attachmentFile.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user_documents")
        .upload(fileName, attachmentFile)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { success: false, error: uploadError.message }
      }

      const { data: urlData } = await supabase.storage.from("user_documents").getPublicUrl(fileName)

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
  const cookieStore = cookies()
  const supabase = createServerClient()

  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id

  try {
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
        .from("user_documents")
        .upload(fileName, attachmentFile)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { success: false, error: uploadError.message }
      }

      const { data: urlData } = await supabase.storage.from("user_documents").getPublicUrl(fileName)

      attachmentUrl = urlData.publicUrl
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
  const cookieStore = cookies()
  const supabase = createServerClient()

  const { data: session } = await supabase.auth.getSession()
  if (!session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id

  try {
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
