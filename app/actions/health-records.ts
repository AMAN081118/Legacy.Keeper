"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { HealthRecord } from "@/lib/supabase/database.types"

export async function getHealthRecords() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user.id) {
    return { success: false, error: "Not authenticated", data: [] }
  }

  const userId = session.session.user.id

  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching health records:", error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data as HealthRecord[] }
}

export async function getHealthRecordById(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user.id) {
    return { success: false, error: "Not authenticated", data: null }
  }

  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.session.user.id)
    .single()

  if (error) {
    console.error("Error fetching health record:", error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data as HealthRecord }
}

export async function createHealthRecord(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user.id) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id
  const memberName = formData.get("memberName") as string
  const dob = formData.get("dob") as string
  const gender = formData.get("gender") as string
  const bloodGroup = formData.get("bloodGroup") as string
  const contactNumber = formData.get("contactNumber") as string
  const medicalConditions = formData.get("medicalConditions") as string
  const allergies = formData.get("allergies") as string
  const medications = formData.get("medications") as string
  const emergencyContact = formData.get("emergencyContact") as string
  const attachmentUrl = formData.get("attachmentUrl") as string

  if (!memberName) {
    return { success: false, error: "Member name is required" }
  }

  const newRecord = {
    id: uuidv4(),
    user_id: userId,
    member_name: memberName,
    dob: dob || null,
    gender: gender || null,
    blood_group: bloodGroup || null,
    contact_number: contactNumber || null,
    medical_conditions: medicalConditions || null,
    allergies: allergies || null,
    medications: medications || null,
    emergency_contact: emergencyContact || null,
    attachment_url: attachmentUrl || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("health_records").insert(newRecord)

  if (error) {
    console.error("Error creating health record:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/health-records")
  return { success: true }
}

export async function updateHealthRecord(id: string, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user.id) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id
  const memberName = formData.get("memberName") as string
  const dob = formData.get("dob") as string
  const gender = formData.get("gender") as string
  const bloodGroup = formData.get("bloodGroup") as string
  const contactNumber = formData.get("contactNumber") as string
  const medicalConditions = formData.get("medicalConditions") as string
  const allergies = formData.get("allergies") as string
  const medications = formData.get("medications") as string
  const emergencyContact = formData.get("emergencyContact") as string
  const attachmentUrl = formData.get("attachmentUrl") as string

  if (!memberName) {
    return { success: false, error: "Member name is required" }
  }

  const updatedRecord = {
    member_name: memberName,
    dob: dob || null,
    gender: gender || null,
    blood_group: bloodGroup || null,
    contact_number: contactNumber || null,
    medical_conditions: medicalConditions || null,
    allergies: allergies || null,
    medications: medications || null,
    emergency_contact: emergencyContact || null,
    attachment_url: attachmentUrl || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("health_records").update(updatedRecord).eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Error updating health record:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/health-records")
  return { success: true }
}

export async function deleteHealthRecord(id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user.id) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.session.user.id

  const { error } = await supabase.from("health_records").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Error deleting health record:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/health-records")
  return { success: true }
}
