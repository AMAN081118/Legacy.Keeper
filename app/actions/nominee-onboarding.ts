"use server"

import { createClient } from "@supabase/supabase-js"

export async function getNomineeDetails(token: string) {
  try {
    // Use service role for this operation since we don't have the user's session yet
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Find the nominee with this token
    const { data: nominee, error: fetchError } = await supabaseAdmin
      .from("nominees")
      .select("*, users:user_id(*)")
      .eq("invitation_token", token)
      .single()

    if (fetchError) {
      console.error("Error fetching nominee:", fetchError)
      return { success: false, error: "Invalid or expired invitation token" }
    }

    // Return the nominee details
    return {
      success: true,
      data: {
        id: nominee.id,
        name: nominee.name,
        inviterName: nominee.users?.name || nominee.users?.email || "Unknown",
        inviterEmail: nominee.users?.email || "Unknown",
        inviterProfileUrl: nominee.users?.profile_photo_url || null,
      },
    }
  } catch (error) {
    console.error("Error in getNomineeDetails:", error)
    return { success: false, error: String(error) }
  }
}

export async function verifyInvitation(token: string, action: "accept" | "reject") {
  try {
    console.log("[verifyInvitation] Called with token:", token, "action:", action)
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Find the nominee with this token
    const { data: nominee, error: fetchError } = await supabaseAdmin
      .from("nominees")
      .select("*")
      .eq("invitation_token", token)
      .single()
    console.log("[verifyInvitation] nominee fetch result:", nominee, fetchError)

    if (fetchError) {
      console.error("[verifyInvitation] Error fetching nominee:", fetchError)
      return { success: false, error: "Invalid or expired invitation token" }
    }

    // Update the nominee status
    const now = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
      .from("nominees")
      .update({
        status: action === "accept" ? "accepted" : "rejected",
        invitation_responded_at: now,
      })
      .eq("id", nominee.id)
    console.log("[verifyInvitation] nominee update error:", updateError)

    if (updateError) {
      console.error("[verifyInvitation] Error updating nominee status:", updateError)
      return { success: false, error: `Error updating nominee status: ${updateError.message}` }
    }

    // If action is 'accept', assign nominee role in user_roles
    if (action === "accept") {
      // Find the user by nominee email
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", nominee.email)
        .single()
      console.log("[verifyInvitation] nominee user fetch:", user, userError)
      if (!userError && user) {
        // Get the 'nominee' role id
        const { data: role, error: roleError } = await supabaseAdmin
          .from("roles")
          .select("id")
          .eq("name", "nominee")
          .single()
        console.log("[verifyInvitation] nominee role fetch:", role, roleError)
        if (!roleError && role) {
          const { error: insertRoleError } = await supabaseAdmin.from("user_roles").insert({
            user_id: user.id,
            role_id: role.id,
            related_user_id: nominee.user_id, // inviter
            created_at: new Date().toISOString(),
          })
          console.log("[verifyInvitation] user_roles insert error:", insertRoleError)
        }
      }
    }

    return { success: true, action }
  } catch (error) {
    console.error("[verifyInvitation] Error in verifyInvitation:", error)
    return { success: false, error: String(error) }
  }
}
