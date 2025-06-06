"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@supabase/supabase-js"
import { createNomineesBucket } from "./create-nominees-bucket"
import { sendInvitationEmail } from "./send-invitation-email"

// Get all nominees for the current user
export async function getNominees() {
  try {
    const supabase = createServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      throw new Error("User not authenticated")
    }

    const { data: nominees, error } = await supabase
      .from("nominees")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching nominees:", error)
      throw new Error(`Error fetching nominees: ${error.message}`)
    }

    return nominees || []
  } catch (error) {
    console.error("Error in getNominees:", error)
    throw error
  }
}

// Get the count of nominees for the current user
export async function getNomineeCount() {
  try {
    const supabase = createServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      throw new Error("User not authenticated")
    }

    const { count, error } = await supabase
      .from("nominees")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user.id)

    if (error) {
      console.error("Error fetching nominee count:", error)
      throw new Error(`Error fetching nominee count: ${error.message}`)
    }

    return count || 0
  } catch (error) {
    console.error("Error in getNomineeCount:", error)
    throw error
  }
}

// Add a new nominee
export async function addNominee(formData: FormData) {
  try {
    const supabase = createServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      throw new Error("User not authenticated")
    }

    // Validate user profile exists (should have been created during registration)
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.user.id)
      .single()

    if (profileError || !userProfile) {
      console.error("User profile not found:", profileError)
      throw new Error("User profile not found. Please contact support or try logging out and back in.")
    }

    // Create the nominees bucket if it doesn't exist
    const { success: bucketSuccess, error: bucketError } = await createNomineesBucket()
    if (!bucketSuccess) {
      throw new Error(`Error creating nominees bucket: ${bucketError}`)
    }

    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const relationship = formData.get("relationship") as string
    const phone = formData.get("phone") as string

    // Extract access categories
    const accessCategories = formData.getAll("accessCategories") as string[]

    // Handle profile photo upload
    const profilePhoto = formData.get("profilePhoto") as File
    let profilePhotoUrl = null
    if (profilePhoto && profilePhoto.size > 0) {
      const fileExt = profilePhoto.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${user.user.id}/${fileName}`

      // Use service role for storage operations
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      const { error: uploadError } = await supabaseAdmin.storage.from("nominees").upload(filePath, profilePhoto, {
        contentType: profilePhoto.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading profile photo:", uploadError)
        throw new Error(`Error uploading profile photo: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: publicUrlData } = supabaseAdmin.storage.from("nominees").getPublicUrl(filePath)

      profilePhotoUrl = publicUrlData.publicUrl
    }

    // Handle government ID upload
    const governmentId = formData.get("governmentId") as File
    let governmentIdUrl = null
    if (governmentId && governmentId.size > 0) {
      const fileExt = governmentId.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${user.user.id}/${fileName}`

      // Use service role for storage operations
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      const { error: uploadError } = await supabaseAdmin.storage.from("nominees").upload(filePath, governmentId, {
        contentType: governmentId.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading government ID:", uploadError)
        throw new Error(`Error uploading government ID: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: publicUrlData } = supabaseAdmin.storage.from("nominees").getPublicUrl(filePath)

      governmentIdUrl = publicUrlData.publicUrl
    }

    // Generate invitation token
    const invitationToken = uuidv4()
    const now = new Date().toISOString()

    // Insert the nominee
    if (!user?.user?.id) {
      throw new Error("User ID not found")
    }
    const { data: nominee, error } = await supabase
      .from("nominees")
      .insert({
        user_id: user.user.id,
        name,
        email,
        relationship,
        phone,
        access_categories: accessCategories,
        profile_photo_url: profilePhotoUrl,
        government_id_url: governmentIdUrl,
        status: "none",
        invitation_token: invitationToken,
        invitation_sent_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding nominee:", error)
      throw new Error(`Error adding nominee: ${error.message}`)
    }

    // Send invitation email
    try {
      if (!user?.user?.email) {
        throw new Error("User email not found")
      }
      await sendInvitationEmail({
        nomineeId: nominee.id,
        nomineeName: name,
        nomineeEmail: email,
        inviterName: user.user.email,
        invitationToken,
      })
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError)
      // Don't fail the whole operation if email sending fails
    }

    return { success: true, nominee }
  } catch (error) {
    console.error("Error in addNominee:", error)
    return { success: false, error: String(error) }
  }
}

// Update an existing nominee
export async function updateNominee(formData: FormData) {
  try {
    const supabase = createServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      throw new Error("User not authenticated")
    }

    // Create the nominees bucket if it doesn't exist
    const { success: bucketSuccess, error: bucketError } = await createNomineesBucket()
    if (!bucketSuccess) {
      throw new Error(`Error creating nominees bucket: ${bucketError}`)
    }

    // Extract form data
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const relationship = formData.get("relationship") as string
    const phone = formData.get("phone") as string

    // Extract access categories
    const accessCategories = formData.getAll("accessCategories") as string[]

    // Get the current nominee to check if email has changed
    const { data: currentNominee, error: fetchError } = await supabase
      .from("nominees")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching current nominee:", fetchError)
      throw new Error(`Error fetching current nominee: ${fetchError.message}`)
    }

    // Prepare update object
    const updateData: any = {
      name,
      relationship,
      phone,
      access_categories: accessCategories,
      updated_at: new Date().toISOString(),
    }

    // If email has changed, update email and reset invitation
    if (email !== currentNominee.email) {
      updateData.email = email
      updateData.status = "pending"
      updateData.invitation_token = uuidv4()
      updateData.invitation_sent_at = new Date().toISOString()
      updateData.invitation_responded_at = null
    }

    // Handle profile photo upload
    const profilePhoto = formData.get("profilePhoto") as File
    if (profilePhoto && profilePhoto.size > 0) {
      const fileExt = profilePhoto.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${user.user.id}/${fileName}`

      // Use service role for storage operations
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      const { error: uploadError } = await supabaseAdmin.storage.from("nominees").upload(filePath, profilePhoto, {
        contentType: profilePhoto.type,
        upsert: true,
      })

      if (uploadError) {
        console.error("Error uploading profile photo:", uploadError)
        throw new Error(`Error uploading profile photo: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: publicUrlData } = supabaseAdmin.storage.from("nominees").getPublicUrl(filePath)

      updateData.profile_photo_url = publicUrlData.publicUrl
    }

    // Handle government ID upload or deletion
    const deleteGovernmentId = formData.get("deleteGovernmentId") === "true";
    if (deleteGovernmentId && currentNominee.government_id_url) {
      // Extract the path from the public URL
      try {
        const url = new URL(currentNominee.government_id_url);
        // The path after the bucket name (e.g. /storage/v1/object/public/nominees/userid/filename.pdf)
        const pathParts = url.pathname.split("/public/nominees/");
        if (pathParts.length === 2) {
          const filePath = pathParts[1];
          const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
          await supabaseAdmin.storage.from("nominees").remove([filePath]);
        }
      } catch (e) {
        console.error("Error parsing or deleting government ID file:", e);
      }
      updateData.government_id_url = null;
    }

    // Update the nominee
    const { data: nominee, error } = await supabase
      .from("nominees")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating nominee:", error)
      throw new Error(`Error updating nominee: ${error.message}`)
    }

    // If email has changed, send a new invitation email
    if (email !== currentNominee.email) {
      try {
        if (!user?.user?.email) {
          throw new Error("User email not found")
        }
        await sendInvitationEmail({
          nomineeId: nominee.id,
          nomineeName: name,
          nomineeEmail: email,
          inviterName: user.user.email,
          invitationToken: updateData.invitation_token,
        })
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError)
        // Don't fail the whole operation if email sending fails
      }
    }

    return { success: true, nominee }
  } catch (error) {
    console.error("Error in updateNominee:", error)
    return { success: false, error: String(error) }
  }
}

// Delete a nominee
export async function deleteNominee(id: string) {
  try {
    const supabase = createServerClient()
    const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      throw new Error("User not authenticated")
    }

    // Fetch the nominee record first
    const { data: nominee, error: fetchError } = await adminClient
      .from("nominees")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.user.id)
      .single()

    if (fetchError || !nominee) {
      console.error("Error fetching nominee for delete:", fetchError)
      throw new Error("Nominee not found")
    }

    // Delete related notifications for this nominee
    await adminClient
      .from("notifications")
      .delete()
      .eq("type", "invitation_received")
      .contains("data", { nomineeId: id })

    // Delete the nominee role from user_roles table
    // Find the user by nominee email
    const { data: nomineeUser, error: nomineeUserError } = await adminClient
      .from("users")
      .select("id")
      .eq("email", nominee.email)
      .single()
    if (!nomineeUserError && nomineeUser) {
      const { data: role, error: roleError } = await adminClient
        .from("roles")
        .select("id")
        .eq("name", "nominee")
        .single()
      if (!roleError && role) {
        await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", nomineeUser.id)
          .eq("related_user_id", user.user.id)
          .eq("role_id", role.id)
      }
    }

    // Delete nominee record using admin client to bypass RLS
    const { error } = await adminClient.from("nominees").delete().eq("id", id).eq("user_id", user.user.id)

    if (error) {
      console.error("Error deleting nominee:", error)
      throw new Error(`Error deleting nominee: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteNominee:", error)
    return { success: false, error: String(error) }
  }
}

// Resend invitation to a nominee
export async function resendInvitation(id: string) {
  try {
    const supabase = createServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      throw new Error("User not authenticated")
    }

    // Get the nominee
    const { data: nominee, error: fetchError } = await supabase
      .from("nominees")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching nominee:", fetchError)
      throw new Error(`Error fetching nominee: ${fetchError.message}`)
    }

    // Generate a new invitation token
    const invitationToken = uuidv4()
    const now = new Date().toISOString()

    // Update the nominee with the new token
    const { error: updateError } = await supabase
      .from("nominees")
      .update({
        invitation_token: invitationToken,
        invitation_sent_at: now,
        status: "pending",
      })
      .eq("id", id)
      .eq("user_id", user.user.id)

    if (updateError) {
      console.error("Error updating nominee:", updateError)
      throw new Error(`Error updating nominee: ${updateError.message}`)
    }

    // Send the invitation email
    try {
      if (!user?.user?.email) {
        throw new Error("User email not found")
      }
      await sendInvitationEmail({
        nomineeId: nominee.id,
        nomineeName: nominee.name,
        nomineeEmail: nominee.email,
        inviterName: user.user.email,
        invitationToken,
      })
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError)
      throw new Error(`Error sending invitation email: ${emailError}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in resendInvitation:", error)
    return { success: false, error: String(error) }
  }
}

// Verify invitation token and update nominee status
export async function verifyInvitation(token: string, action: "accept" | "reject") {
  try {
    const supabase = createServerClient()

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.user) {
      throw new Error("User not authenticated")
    }

    // Get the nominee by invitation token
    const { data: nominee, error: nomineeError } = await supabase
      .from("nominees")
      .select("*")
      .eq("invitation_token", token)
      .single()

    if (nomineeError || !nominee) {
      throw new Error("Invalid or expired invitation token")
    }

    // Update the nominee's status
    const { error: updateError } = await supabase
      .from("nominees")
      .update({
        status: action === "accept" ? "accepted" : "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", nominee.id)

    if (updateError) {
      throw new Error(`Error updating nominee status: ${updateError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in verifyInvitation:", error)
    return { success: false, error: String(error) }
  }
}
