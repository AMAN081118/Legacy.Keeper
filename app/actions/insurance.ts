"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"
import type { Insurance } from "@/lib/supabase/database.types"

export async function getInsuranceCount() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    return { count: 0 }
  }

  const { count, error } = await supabase
    .from("insurance")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.session.user.id)

  if (error) {
    console.error("Error fetching insurance count:", error)
    return { count: 0 }
  }

  return { count: count || 0 }
}

export async function getInsuranceList(page = 1, pageSize = 5, insuranceType?: string, searchQuery?: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    return { data: [], count: 0 }
  }

  const userId = session.session.user.id
  const startIndex = (page - 1) * pageSize

  let query = supabase
    .from("insurance")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("date", { ascending: false })

  // Apply insurance type filter if provided
  if (insuranceType && insuranceType !== "All") {
    query = query.eq("insurance_type", insuranceType)
  }

  // Apply search query if provided
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  // Pagination
  const { data, error, count } = await query.range(startIndex, startIndex + pageSize - 1)

  if (error) {
    console.error("Error fetching insurance list:", error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

export async function addInsurance(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id
  const name = formData.get("name") as string
  const insuranceType = formData.get("insuranceType") as Insurance["insurance_type"]
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0]
  const amount = Number.parseFloat(formData.get("amount") as string) || 0
  const coveragePeriod = formData.get("coveragePeriod") as string
  const description = formData.get("description") as string
  const attachmentUrl = (formData.get("attachmentUrl") as string) || null

  // Validate required fields
  if (!name || !insuranceType || !date || isNaN(amount)) {
    return { success: false, error: "Missing required fields" }
  }

  const newInsurance = {
    id: uuidv4(),
    user_id: userId,
    name,
    insurance_type: insuranceType,
    date,
    amount,
    coverage_period: coveragePeriod || null,
    description: description || null,
    attachment_url: attachmentUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const { error } = await supabase.from("insurance").insert(newInsurance)

    if (error) {
      console.error("Error adding insurance:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/insurance")
    return { success: true }
  } catch (err) {
    console.error("Exception adding insurance:", err)
    return { success: false, error: "Failed to add insurance" }
  }
}

export async function updateInsurance(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const insuranceType = formData.get("insuranceType") as Insurance["insurance_type"]
  const date = formData.get("date") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const coveragePeriod = formData.get("coveragePeriod") as string
  const description = formData.get("description") as string
  const attachmentUrl = (formData.get("attachmentUrl") as string) || null

  const updatedInsurance = {
    name,
    insurance_type: insuranceType,
    date,
    amount,
    coverage_period: coveragePeriod || null,
    description: description || null,
    attachment_url: attachmentUrl,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("insurance")
    .update(updatedInsurance)
    .eq("id", id)
    .eq("user_id", session.session.user.id)

  if (error) {
    console.error("Error updating insurance:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/insurance")
  return { success: true }
}

export async function deleteInsurance(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("insurance").delete().eq("id", id).eq("user_id", session.session.user.id)

  if (error) {
    console.error("Error deleting insurance:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/insurance")
  return { success: true }
}

export async function getInsuranceById(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("insurance")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.session.user.id)
    .single()

  if (error) {
    console.error("Error fetching insurance:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
