"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function registerUser(prevState: { error: string | null }, formData: FormData) {
  try {
    // Get form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const dob = formData.get("dob") as string
    const gender = formData.get("gender") as string

    // Create a Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        phone,
        dob,
        gender,
      },
    })

    if (authError) {
      throw authError
    }

    // Create the user profile
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        name,
        email,
        phone,
        dob,
        gender,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw profileError
      }

      // After creating the user profile, assign the default 'user' role
      // Assign default role to new user
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "user")
        .single()
      if (!roleError && roleData) {
        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role_id: roleData.id,
          related_user_id: null,
          created_at: new Date().toISOString(),
        })
      }
    }

    // Create a session by signing in
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError) {
      throw sessionError
    }

    // Redirect to dashboard
    redirect("/dashboard")
  } catch (error: any) {
    console.error("Registration error:", error)
    return { error: error.message || "Registration failed" }
  }
}
