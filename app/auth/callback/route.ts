import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error.message)
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url))
      }

      // Redirect to the dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/?error=Something went wrong during authentication", request.url))
  }

  // If no code is provided or any other error occurs, redirect to the home page
  return NextResponse.redirect(new URL("/", request.url))
}
