"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { HealthCondition } from "@/lib/supabase/database.types"
import { createServerClient } from "@/lib/supabase/server"

interface AddHealthConditionParams {
  healthRecordId: string
  conditionName: string
  doctorName: string | null
  visitDate: string | null
  description: string | null
  attachmentUrl: string | null
}

export async function addHealthCondition({
  healthRecordId,
  conditionName,
  doctorName,
  visitDate,
  description,
  attachmentUrl,
}: AddHealthConditionParams) {
  const supabase = createServerActionClient({ cookies })

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Add the health condition
  const { error } = await supabase.from("health_conditions").insert({
    health_record_id: healthRecordId,
    condition_name: conditionName,
    doctor_name: doctorName,
    visit_date: visitDate,
    description,
    attachment_url: attachmentUrl,
  })

  if (error) {
    console.error("Error adding health condition:", error)
    throw new Error("Failed to add health condition")
  }

  revalidatePath(`/dashboard/health-records/${healthRecordId}`)
}

export async function getHealthConditions(healthRecordId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from("health_conditions")
    .select("*")
    .eq("health_record_id", healthRecordId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching health conditions:", error)
    return []
  }

  return data
}

export async function getHealthConditionById(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user.id) {
    return { success: false, error: "Not authenticated", data: null }
  }

  const { data, error } = await supabase.from("health_conditions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching health condition:", error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data as HealthCondition }
}

export async function deleteHealthCondition(id: string, healthRecordId: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.from("health_conditions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting health condition:", error)
    throw new Error("Failed to delete health condition")
  }

  revalidatePath(`/dashboard/health-records/${healthRecordId}`)
}

export async function updateHealthCondition(formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const id = formData.get("id") as string
    const healthRecordId = formData.get("health_record_id") as string
    const conditionName = formData.get("condition_name") as string
    const doctorName = formData.get("doctor_name") as string | null
    const visitDate = formData.get("visit_date") as string | null
    const description = formData.get("description") as string | null
    const attachmentUrl = formData.get("attachment_url") as string | null

    // Update the health condition
    const { data, error } = await supabase
      .from("health_conditions")
      .update({
        condition_name: conditionName,
        doctor_name: doctorName,
        visit_date: visitDate,
        description: description,
        attachment_url: attachmentUrl,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating health condition:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/dashboard/health-records/${healthRecordId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating health condition:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
