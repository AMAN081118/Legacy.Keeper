import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Add CORS headers
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Only allow unauthenticated users to access registration, login, and landing pages
    const isPublicPage = req.nextUrl.pathname === "/" || 
                        req.nextUrl.pathname.startsWith("/auth") ||
                        req.nextUrl.pathname.startsWith("/landing")

    if (!session && !isPublicPage) {
      // Not logged in and trying to access a protected route
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and tries to access registration/login, redirect to dashboard
    if (session && req.nextUrl.pathname.startsWith("/auth")) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
