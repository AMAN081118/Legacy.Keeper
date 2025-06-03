"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
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

    // Validate user profile exists (should have been created during registration)
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      console.error("User profile not found:", profileError)
      return { error: "User profile not found. Please contact support or try logging out and back in." }
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

    // Generate invitation token
    const invitationToken = uuidv4()
    const now = new Date().toISOString()

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
        status: "pending",
        invitation_token: invitationToken,
        invitation_sent_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding trustee:", error)
      return { error: "Failed to add trustee" }
    }

    // Create notification for trustee if user exists
    const { data: trusteeUser, error: trusteeUserError } = await adminClient
      .from("users")
      .select("id")
      .eq("email", email)
      .single()
    if (!trusteeUserError && trusteeUser) {
      // Generate invitation link with token
      const invitationLink = `/trustee-onboarding?token=${invitationToken}`
      await adminClient.from("notifications").insert({
        user_id: trusteeUser.id,
        title: "Trustee Invitation",
        message: `${user.user_metadata?.name || user.email} has invited you to be their trustee.`,
        type: "invitation_received",
        data: {
          invitationLink,
          trusteeId: data.id,
          inviterName: user.user_metadata?.name || user.email
        },
      })
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

// Get trustee details for onboarding using current user session
export async function getTrusteeOnboardingDetailsFromSession() {
  try {
    console.log("Fetching trustee details from current user session")
    const supabase = createServerClient()

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Error getting authenticated user:", authError)
      return { success: false, error: "User not authenticated" }
    }

    console.log("Current user:", user.email)

    // Use admin client for database queries
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Find the trustee record by email
    const { data: trustee, error: trusteeError } = await supabaseAdmin
      .from("trustees")
      .select(`
        id,
        name,
        email,
        relationship,
        phone,
        profile_photo_url,
        user_id,
        status,
        invitation_token
      `)
      .eq("email", user.email)
      .single()

    if (trusteeError) {
      console.error("Error fetching trustee:", trusteeError)
      return { success: false, error: "Trustee not found. You may not have been invited as a trustee." }
    }

    console.log("Found trustee:", trustee)

    // Get the inviter's details separately
    const { data: inviterData, error: inviterError } = await supabaseAdmin
      .from("users")
      .select("name, email, government_id_url")
      .eq("id", trustee.user_id)
      .single()

    if (inviterError) {
      console.error("Error fetching inviter:", inviterError)
      // Continue without inviter data rather than failing completely
    } else {
      console.log("Found inviter:", inviterData)
    }

    return {
      success: true,
      data: {
        id: trustee.id,
        name: trustee.name,
        email: trustee.email,
        relationship: trustee.relationship,
        phone: trustee.phone,
        profilePhotoUrl: trustee.profile_photo_url,
        status: trustee.status,
        invitationToken: trustee.invitation_token,
        inviter: {
          name: inviterData?.name || "Legacy Keeper User",
          email: inviterData?.email || "",
          profilePhotoUrl: inviterData?.government_id_url || null
        }
      }
    }
  } catch (error) {
    console.error("Error in getTrusteeOnboardingDetailsFromSession:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get trustee details for onboarding (legacy email-based method)
export async function getTrusteeOnboardingDetails(email: string) {
  try {
    console.log("Fetching trustee details for email:", email)
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // First, let's check if there are any trustees in the database
    const { data: allTrustees, error: allTrusteesError } = await supabaseAdmin
      .from("trustees")
      .select("email")
      .limit(10)

    console.log("All trustees in database:", allTrustees)
    if (allTrusteesError) {
      console.error("Error fetching all trustees:", allTrusteesError)
    } else if (allTrustees && allTrustees.length === 0) {
      console.log("No trustees found in the database")
    }

    // Find the trustee record by email
    const { data: trustee, error: trusteeError } = await supabaseAdmin
      .from("trustees")
      .select(`
        id,
        name,
        email,
        relationship,
        phone,
        profile_photo_url,
        user_id
      `)
      .eq("email", email)
      .single()

    if (trusteeError) {
      console.error("Error fetching trustee:", trusteeError)
      return { success: false, error: "Trustee not found or invalid email" }
    }

    console.log("Found trustee:", trustee)

    // Get the inviter's details separately
    const { data: inviterData, error: inviterError } = await supabaseAdmin
      .from("users")
      .select("name, email, government_id_url")
      .eq("id", trustee.user_id)
      .single()

    if (inviterError) {
      console.error("Error fetching inviter:", inviterError)
      // Continue without inviter data rather than failing completely
    } else {
      console.log("Found inviter:", inviterData)
    }

    return {
      success: true,
      data: {
        id: trustee.id,
        name: trustee.name,
        email: trustee.email,
        relationship: trustee.relationship,
        phone: trustee.phone,
        profilePhotoUrl: trustee.profile_photo_url,
        inviter: {
          name: inviterData?.name || "Legacy Keeper User",
          email: inviterData?.email || "",
          profilePhotoUrl: inviterData?.government_id_url || null
        }
      }
    }
  } catch (error) {
    console.error("Error in getTrusteeOnboardingDetails:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Accept trustee invitation
export async function acceptTrusteeInvitation(token: string) {
  try {
    console.log("Accepting trustee invitation with token:", token)
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Find trustee by token and email
    const { data: trustee, error: trusteeError } = await adminClient
      .from("trustees")
      .select("*")
      .eq("invitation_token", token)
      .eq("email", user.email)
      .single()

    if (trusteeError || !trustee) {
      console.error("Error finding trustee:", trusteeError)
      return { success: false, error: "Invalid invitation token or you're not authorized to accept this invitation" }
    }

    // Check if already responded
    if (trustee.status !== "pending") {
      return { success: false, error: `Invitation already ${trustee.status}` }
    }

    const now = new Date().toISOString()

    // Update trustee status and invalidate token
    const { data: updatedTrustee, error: updateError } = await adminClient
      .from("trustees")
      .update({
        status: "accepted",
        approval_type: "accepted",
        invitation_responded_at: now,
        updated_at: now,
        invitation_token: null
      })
      .eq("id", trustee.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating trustee status:", updateError)
      return { success: false, error: "Failed to accept invitation" }
    }

    // Delete related notifications for this trustee invitation
    await adminClient
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("type", "invitation_received")
      .contains("data", { trusteeId: trustee.id })

    // Get trustee role ID
    const { data: trusteeRole, error: roleError } = await adminClient
      .from("roles")
      .select("id")
      .eq("name", "trustee")
      .single()

    if (roleError || !trusteeRole) {
      console.error("Trustee role not found:", roleError)
      return { success: false, error: "Trustee role not found in system" }
    }

    // Add trustee role to user_roles table
    const { error: roleAssignError } = await adminClient
      .from("user_roles")
      .insert({
        user_id: user.id,
        role_id: trusteeRole.id,
        related_user_id: trustee.user_id, // The person who invited them
        created_at: now
      })

    if (roleAssignError) {
      console.error("Error assigning trustee role:", roleAssignError)
      // Don't fail the acceptance if role assignment fails, but log it
      console.warn("Trustee invitation accepted but role assignment failed")
    }

    // Send notification to inviter
    await adminClient.from("notifications").insert({
      user_id: trustee.user_id,
      title: "Trustee Invitation Accepted",
      message: `${trustee.name} (${trustee.email}) has accepted your trustee invitation.`,
      type: "invitation_received",
      data: {
        trusteeId: trustee.id,
        trusteeName: trustee.name,
        trusteeEmail: trustee.email,
        action: "accepted"
      }
    })

    console.log("Trustee invitation accepted successfully:", updatedTrustee)
    return { success: true, data: updatedTrustee }
  } catch (error) {
    console.error("Error in acceptTrusteeInvitation:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Reject trustee invitation
export async function rejectTrusteeInvitation(token: string) {
  try {
    console.log("Rejecting trustee invitation with token:", token)
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Find trustee by token and email
    const { data: trustee, error: trusteeError } = await adminClient
      .from("trustees")
      .select("*")
      .eq("invitation_token", token)
      .eq("email", user.email)
      .single()

    if (trusteeError || !trustee) {
      console.error("Error finding trustee:", trusteeError)
      return { success: false, error: "Invalid invitation token or you're not authorized to reject this invitation" }
    }

    // Check if already responded
    if (trustee.status !== "pending") {
      return { success: false, error: `Invitation already ${trustee.status}` }
    }

    const now = new Date().toISOString()

    // Update trustee status and invalidate token
    const { data: updatedTrustee, error: updateError } = await adminClient
      .from("trustees")
      .update({
        status: "rejected",
        approval_type: "rejected",
        invitation_responded_at: now,
        updated_at: now,
        invitation_token: null
      })
      .eq("id", trustee.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating trustee status:", updateError)
      return { success: false, error: "Failed to reject invitation" }
    }

    // Delete related notifications for this trustee invitation
    await adminClient
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("type", "invitation_received")
      .contains("data", { trusteeId: trustee.id })

    // Send notification to inviter
    await adminClient.from("notifications").insert({
      user_id: trustee.user_id,
      title: "Trustee Invitation Rejected",
      message: `${trustee.name} (${trustee.email}) has rejected your trustee invitation.`,
      type: "invitation_received",
      data: {
        trusteeId: trustee.id,
        trusteeName: trustee.name,
        trusteeEmail: trustee.email,
        action: "rejected"
      }
    })

    console.log("Trustee invitation rejected successfully:", updatedTrustee)
    return { success: true, data: updatedTrustee }
  } catch (error) {
    console.error("Error in rejectTrusteeInvitation:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get trustee invitation details by token
export async function getTrusteeInvitationByToken(token: string) {
  try {
    const adminClient = createAdminClient()

    // Find trustee by token
    const { data: trustee, error: trusteeError } = await adminClient
      .from("trustees")
      .select(`
        id,
        name,
        email,
        relationship,
        phone,
        status,
        invitation_sent_at,
        user_id,
        users:user_id(name, email)
      `)
      .eq("invitation_token", token)
      .single()

    if (trusteeError || !trustee) {
      console.error("Error finding trustee invitation:", trusteeError)
      return { success: false, error: "Invalid or expired invitation token" }
    }

    // Check if invitation is still pending
    if (trustee.status !== "pending") {
      return {
        success: false,
        error: `This invitation has already been ${trustee.status}`,
        status: trustee.status
      }
    }

    return {
      success: true,
      data: {
        trustee: {
          id: trustee.id,
          name: trustee.name,
          email: trustee.email,
          relationship: trustee.relationship,
          phone: trustee.phone,
          status: trustee.status,
          invitation_sent_at: trustee.invitation_sent_at
        },
        inviter: {
          name: trustee.name || "",
          email: trustee.email || ""
        }
      }
    }
  } catch (error) {
    console.error("Error in getTrusteeInvitationByToken:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Accept trustee invitation using session (current user's email)
export async function acceptTrusteeInvitationFromSession() {
  try {
    console.log("Accepting trustee invitation from session")
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Find trustee by user's email
    const { data: trustee, error: trusteeError } = await adminClient
      .from("trustees")
      .select("*")
      .eq("email", user.email)
      .single()

    if (trusteeError || !trustee) {
      console.error("Error finding trustee:", trusteeError)
      return { success: false, error: "Trustee invitation not found for your email" }
    }

    // Check if already responded
    if (trustee.status && trustee.status !== "pending") {
      return { success: false, error: `Invitation already ${trustee.status}` }
    }

    const now = new Date().toISOString()

    // Update trustee status
    const { data: updatedTrustee, error: updateError } = await adminClient
      .from("trustees")
      .update({
        status: "accepted",
        invitation_responded_at: now,
        updated_at: now
      })
      .eq("id", trustee.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating trustee status:", updateError)
      return { success: false, error: "Failed to accept invitation" }
    }

    // Get trustee role ID
    const { data: trusteeRole, error: roleError } = await adminClient
      .from("roles")
      .select("id")
      .eq("name", "trustee")
      .single()

    if (roleError || !trusteeRole) {
      console.error("Trustee role not found:", roleError)
      return { success: false, error: "Trustee role not found in system" }
    }

    // Add trustee role to user_roles table
    const { error: roleAssignError } = await adminClient
      .from("user_roles")
      .insert({
        user_id: user.id,
        role_id: trusteeRole.id,
        related_user_id: trustee.user_id, // The person who invited them
        created_at: now
      })

    if (roleAssignError) {
      console.error("Error assigning trustee role:", roleAssignError)
      // Don't fail the acceptance if role assignment fails, but log it
      console.warn("Trustee invitation accepted but role assignment failed")
    }

    // Send notification to inviter
    await adminClient.from("notifications").insert({
      user_id: trustee.user_id,
      title: "Trustee Invitation Accepted",
      message: `${trustee.name} (${trustee.email}) has accepted your trustee invitation.`,
      type: "invitation_received",
      data: {
        trusteeId: trustee.id,
        trusteeName: trustee.name,
        trusteeEmail: trustee.email,
        action: "accepted"
      }
    })

    console.log("Trustee invitation accepted successfully:", updatedTrustee)
    return { success: true, data: updatedTrustee }
  } catch (error) {
    console.error("Error in acceptTrusteeInvitationFromSession:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Reject trustee invitation using session (current user's email)
export async function rejectTrusteeInvitationFromSession() {
  try {
    console.log("Rejecting trustee invitation from session")
    const supabase = createServerClient()
    const adminClient = createAdminClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Find trustee by user's email
    const { data: trustee, error: trusteeError } = await adminClient
      .from("trustees")
      .select("*")
      .eq("email", user.email)
      .single()

    if (trusteeError || !trustee) {
      console.error("Error finding trustee:", trusteeError)
      return { success: false, error: "Trustee invitation not found for your email" }
    }

    // Check if already responded
    if (trustee.status && trustee.status !== "pending") {
      return { success: false, error: `Invitation already ${trustee.status}` }
    }

    const now = new Date().toISOString()

    // Update trustee status
    const { data: updatedTrustee, error: updateError } = await adminClient
      .from("trustees")
      .update({
        status: "rejected",
        approval_type: "rejected",
        invitation_responded_at: now,
        updated_at: now
      })
      .eq("id", trustee.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating trustee status:", updateError)
      return { success: false, error: "Failed to reject invitation" }
    }

    // Send notification to inviter
    await adminClient.from("notifications").insert({
      user_id: trustee.user_id,
      title: "Trustee Invitation Rejected",
      message: `${trustee.name} (${trustee.email}) has rejected your trustee invitation.`,
      type: "invitation_received",
      data: {
        trusteeId: trustee.id,
        trusteeName: trustee.name,
        trusteeEmail: trustee.email,
        action: "rejected"
      }
    })

    console.log("Trustee invitation rejected successfully:", updatedTrustee)
    return { success: true, data: updatedTrustee }
  } catch (error) {
    console.error("Error in rejectTrusteeInvitationFromSession:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}