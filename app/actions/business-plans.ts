"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { uploadFile } from "./upload"

export async function getBusinessPlans(sessionUserId?: string, currentRole?: { name: string, relatedUser?: { email: string | null } | null }) {
  const supabase = createServerClient()

  let userId = sessionUserId

  if (!userId) {
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session.session?.user) {
      console.error("Error fetching session:", sessionError)
      return { error: "Not authenticated", data: null }
    }
    userId = session.session.user.id
  }

  // If currentRole is nominee, get related user's id by email
  if (currentRole?.name === "nominee" && currentRole.relatedUser?.email) {
    const { data: user } = await supabase.from("users").select("id").eq("email", currentRole.relatedUser.email).single()
    if (user?.id) userId = user.id
  }

  console.log("[BusinessPlans] Current session role:", currentRole);

  const { data, error } = await supabase
    .from("business_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching business plans:", error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function addBusinessPlan(formData: FormData) {
  try {
    const supabase = createServerClient()

    const { data: session, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session.session?.user) {
      console.error("Error fetching session:", sessionError)
      return { error: "Not authenticated", success: false }
    }

    const userId = session.session.user.id
    const businessName = formData.get("businessName") as string
    const businessType = formData.get("businessType") as string
    const ownershipPercentage = formData.get("ownershipPercentage") as string
    const investmentAmount = Number.parseFloat(formData.get("investmentAmount") as string)
    const successionPlans = formData.get("successionPlans") as string
    const file = formData.get("file") as File | null

    if (!businessName || !businessType || isNaN(investmentAmount)) {
      return { error: "Missing required fields", success: false }
    }

    let attachmentUrl = null

    if (file && file.size > 0) {
      try {
        // Generate a unique file path
        const fileExt = file.name.split(".").pop() || "file"
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `business_plans/${userId}/${fileName}`

        // Convert file to ArrayBuffer for server upload
        const arrayBuffer = await file.arrayBuffer()

        // Use server action to upload file
        const result = await uploadFile("user_documents", filePath, arrayBuffer, file.type)

        if (!result.success || !result.url) {
          throw new Error(result.error || "Failed to upload file")
        }

        attachmentUrl = result.url
      } catch (error: any) {
        console.error("Error processing file:", error)
        return { error: `Error uploading file: ${error.message}`, success: false }
      }
    }

    const { error } = await supabase.from("business_plans").insert({
      id: uuidv4(),
      user_id: userId,
      business_name: businessName,
      business_type: businessType,
      ownership_percentage: ownershipPercentage,
      investment_amount: investmentAmount,
      succession_plans: successionPlans,
      attachment_url: attachmentUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error adding business plan:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/business-plans")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error adding business plan:", error)
    return { error: error.message, success: false }
  }
}

export async function updateBusinessPlan(formData: FormData) {
  try {
    const supabase = createServerClient()

    const { data: session, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session.session?.user) {
      console.error("Error fetching session:", sessionError)
      return { error: "Not authenticated", success: false }
    }

    const userId = session.session.user.id
    const id = formData.get("id") as string
    const businessName = formData.get("businessName") as string
    const businessType = formData.get("businessType") as string
    const ownershipPercentage = formData.get("ownershipPercentage") as string
    const investmentAmount = Number.parseFloat(formData.get("investmentAmount") as string)
    const successionPlans = formData.get("successionPlans") as string
    const file = formData.get("file") as File | null

    if (!id || !businessName || !businessType || isNaN(investmentAmount)) {
      return { error: "Missing required fields", success: false }
    }

    // Verify ownership
    const { data: existingPlan, error: fetchError } = await supabase
      .from("business_plans")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (fetchError || !existingPlan) {
      console.error("Error fetching business plan or not found:", fetchError)
      return { error: "Business plan not found or you do not have permission", success: false }
    }

    let attachmentUrl = existingPlan.attachment_url

    if (file && file.size > 0) {
      try {
        // Generate a unique file path
        const fileExt = file.name.split(".").pop() || "file"
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `business_plans/${userId}/${fileName}`

        // Convert file to ArrayBuffer for server upload
        const arrayBuffer = await file.arrayBuffer()

        // Use server action to upload file
        const result = await uploadFile("user_documents", filePath, arrayBuffer, file.type)

        if (!result.success || !result.url) {
          throw new Error(result.error || "Failed to upload file")
        }

        attachmentUrl = result.url
      } catch (error: any) {
        console.error("Error processing file:", error)
        return { error: `Error uploading file: ${error.message}`, success: false }
      }
    }

    const { error } = await supabase
      .from("business_plans")
      .update({
        business_name: businessName,
        business_type: businessType,
        ownership_percentage: ownershipPercentage,
        investment_amount: investmentAmount,
        succession_plans: successionPlans,
        attachment_url: attachmentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating business plan:", error)
      return { error: error.message, success: false }
    }

    revalidatePath("/dashboard/business-plans")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating business plan:", error)
    return { error: error.message, success: false }
  }
}

export async function deleteBusinessPlan(id: string) {
  const supabase = createServerClient()

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    console.error("Error fetching session:", sessionError)
    return { error: "Not authenticated", success: false }
  }

  const userId = session.session.user.id

  // Verify ownership
  const { data: existingPlan, error: fetchError } = await supabase
    .from("business_plans")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingPlan) {
    console.error("Error fetching business plan or not found:", fetchError)
    return { error: "Business plan not found or you do not have permission", success: false }
  }

  // Delete the attachment if it exists
  if (existingPlan.attachment_url) {
    try {
      const path = existingPlan.attachment_url.split("/").pop()
      if (path) {
        const { error: deleteFileError } = await supabase.storage.from("user_documents").remove([`${userId}/${path}`])

        if (deleteFileError) {
          console.error("Error deleting file:", deleteFileError)
          // Continue with deletion even if file deletion fails
        }
      }
    } catch (error) {
      console.error("Error processing file deletion:", error)
      // Continue with deletion even if file deletion fails
    }
  }

  const { error } = await supabase.from("business_plans").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Error deleting business plan:", error)
    return { error: error.message, success: false }
  }

  revalidatePath("/dashboard/business-plans")
  return { success: true, error: null }
}

export async function getBusinessPlanById(id: string) {
  const supabase = createServerClient()

  const { data: session, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session.session?.user) {
    console.error("Error fetching session:", sessionError)
    return { error: "Not authenticated", data: null }
  }

  const userId = session.session.user.id

  const { data, error } = await supabase.from("business_plans").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching business plan:", error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}
