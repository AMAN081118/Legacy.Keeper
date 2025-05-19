"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function addTrustee(formData: FormData) {
  try {
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Check if user already has a trustee
    const { data: existingTrustees, error: checkError } = await supabase
      .from("trustees")
      .select("id")
      .eq("user_id", user.id)

    if (checkError) {
      console.error("Error checking existing trustees:", checkError)
      return { error: "Failed to check existing trustees" }
    }

    if (existingTrustees && existingTrustees.length > 0) {
      return { error: "You can only add one trustee" }
    }

    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const relationship = formData.get("relationship") as string
    const phone = formData.get("phone") as string
    const approvalType = formData.get("approvalType") as string
    const profilePhoto = formData.get("profilePhoto") as File
    const governmentId = formData.get("governmentId") as File

    // Validate required fields
    if (!name || !email || !relationship || !phone || !approvalType) {
      return { error: "Missing required fields" }
    }

    // Create trustees bucket if it doesn't exist
    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "trustees")

    if (!bucketExists) {
      await adminClient.storage.createBucket("trustees", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })
    }

    // Upload profile photo if provided
    let profilePhotoUrl = null
    if (profilePhoto && profilePhoto.size > 0) {
      const profilePhotoExt = profilePhoto.name.split(".").pop()
      const profilePhotoPath = `${user.id}/${uuidv4()}.${profilePhotoExt}`

      // Use admin client to bypass RLS
      const { error: uploadError } = await adminClient.storage.from("trustees").upload(profilePhotoPath, profilePhoto, {
        contentType: profilePhoto.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading profile photo:", uploadError)
        return { error: "Failed to upload profile photo" }
      }

      const { data: urlData } = adminClient.storage.from("trustees").getPublicUrl(profilePhotoPath)

      profilePhotoUrl = urlData.publicUrl
    }

    // Upload government ID if provided
    let governmentIdUrl = null
    if (governmentId && governmentId.size > 0) {
      const governmentIdExt = governmentId.name.split(".").pop()
      const governmentIdPath = `${user.id}/${uuidv4()}.${governmentIdExt}`

      // Use admin client to bypass RLS
      const { error: uploadError } = await adminClient.storage.from("trustees").upload(governmentIdPath, governmentId, {
        contentType: governmentId.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading government ID:", uploadError)
        return { error: "Failed to upload government ID" }
      }

      const { data: urlData } = adminClient.storage.from("trustees").getPublicUrl(governmentIdPath)

      governmentIdUrl = urlData.publicUrl
    }

    // Insert trustee record using admin client to bypass RLS
    const { data, error } = await adminClient
      .from("trustees")
      .insert({
        user_id: user.id,
        name,
        email,
        relationship,
        phone,
        profile_photo_url: profilePhotoUrl,
        government_id_url: governmentIdUrl,
        approval_type: approvalType,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding trustee:", error)
      return { error: "Failed to add trustee" }
    }

    revalidatePath("/dashboard/trustees")
    revalidatePath("/dashboard")

    return { data }
  } catch (error) {
    console.error("Error in addTrustee:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateTrustee(formData: FormData) {
  try {
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Extract form data
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const relationship = formData.get("relationship") as string
    const phone = formData.get("phone") as string
    const approvalType = formData.get("approvalType") as string
    const profilePhoto = formData.get("profilePhoto") as File
    const governmentId = formData.get("governmentId") as File

    // Validate required fields
    if (!id || !name || !email || !relationship || !phone || !approvalType) {
      return { error: "Missing required fields" }
    }

    // Get existing trustee data
    const { data: existingTrustee, error: getError } = await supabase
      .from("trustees")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (getError) {
      console.error("Error getting trustee:", getError)
      return { error: "Failed to get trustee" }
    }

    // Create trustees bucket if it doesn't exist
    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "trustees")

    if (!bucketExists) {
      await adminClient.storage.createBucket("trustees", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })
    }

    // Upload profile photo if provided
    let profilePhotoUrl = existingTrustee.profile_photo_url
    if (profilePhoto && profilePhoto.size > 0) {
      const profilePhotoExt = profilePhoto.name.split(".").pop()
      const profilePhotoPath = `${user.id}/${uuidv4()}.${profilePhotoExt}`

      // Use admin client to bypass RLS
      const { error: uploadError } = await adminClient.storage.from("trustees").upload(profilePhotoPath, profilePhoto, {
        contentType: profilePhoto.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading profile photo:", uploadError)
        return { error: "Failed to upload profile photo" }
      }

      const { data: urlData } = adminClient.storage.from("trustees").getPublicUrl(profilePhotoPath)

      profilePhotoUrl = urlData.publicUrl
    }

    // Upload government ID if provided
    let governmentIdUrl = existingTrustee.government_id_url
    if (governmentId && governmentId.size > 0) {
      const governmentIdExt = governmentId.name.split(".").pop()
      const governmentIdPath = `${user.id}/${uuidv4()}.${governmentIdExt}`

      // Use admin client to bypass RLS
      const { error: uploadError } = await adminClient.storage.from("trustees").upload(governmentIdPath, governmentId, {
        contentType: governmentId.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading government ID:", uploadError)
        return { error: "Failed to upload government ID" }
      }

      const { data: urlData } = adminClient.storage.from("trustees").getPublicUrl(governmentIdPath)

      governmentIdUrl = urlData.publicUrl
    }

    // Update trustee record using admin client to bypass RLS
    const { data, error } = await adminClient
      .from("trustees")
      .update({
        name,
        email,
        relationship,
        phone,
        profile_photo_url: profilePhotoUrl,
        government_id_url: governmentIdUrl,
        approval_type: approvalType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating trustee:", error)
      return { error: "Failed to update trustee" }
    }

    revalidatePath("/dashboard/trustees")
    revalidatePath("/dashboard")

    return { data }
  } catch (error) {
    console.error("Error in updateTrustee:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deleteTrustee(id: string) {
  try {
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Delete trustee record using admin client to bypass RLS
    const { error } = await adminClient.from("trustees").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting trustee:", error)
      return { error: "Failed to delete trustee" }
    }

    revalidatePath("/dashboard/trustees")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteTrustee:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getTrustees() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Get trustees
    const { data, error } = await supabase
      .from("trustees")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting trustees:", error)
      return { error: "Failed to get trustees" }
    }

    return { data }
  } catch (error) {
    console.error("Error in getTrustees:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getTrusteeCount() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // Get trustee count
    const { count, error } = await supabase
      .from("trustees")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error getting trustee count:", error)
      return { error: "Failed to get trustee count" }
    }

    return { count }
  } catch (error) {
    console.error("Error in getTrusteeCount:", error)
    return { error: "An unexpected error occurred" }
  }
}
